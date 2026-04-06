module.exports = app => {
    const {
        getAllGuidesService,
        getGuideBySlugService,
        createGuideService,
        updateGuideService,
        deleteGuideService,
    } = app.src.main.services.GuideService;
    const moment = require('moment');

    /* ── In-memory cache (same pattern as HousesController) ── */
    const guideListCache = new Map();       // key: "all" | "published"
    const guideSlugCache = new Map();       // key: slug string
    const CACHE_TTL_MINUTES = 5;

    const invalidateGuideCache = () => {
        guideListCache.clear();
        guideSlugCache.clear();
    };

    const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const DEFAULT_MAX_CONTENT_MB = 40;
    const parsedMaxContentMb = Number(process.env.GUIDE_EDITOR_MAX_CONTENT_MB);
    const MAX_CONTENT_MB = Number.isFinite(parsedMaxContentMb) && parsedMaxContentMb > 0
        ? parsedMaxContentMb
        : DEFAULT_MAX_CONTENT_MB;
    const MAX_CONTENT_SIZE = MAX_CONTENT_MB * 1024 * 1024;
    const CONTENT_TOO_LARGE_MESSAGE = `Content too large. Maximum ${MAX_CONTENT_MB} MB.`;
    const hasLocalizedValue = (field) => {
        if (!field || typeof field !== 'object') {
            return false;
        }

        return Object.values(field).some((value) => (
            typeof value === 'string' && value.trim().length > 0
        ));
    };
    const normalizeLocalizedObject = (field, fallback) => {
        if (!field || typeof field !== 'object') {
            return fallback;
        }
        return field;
    };
    const normalizeLocalizedObjectWithFallback = (field, fallback) => {
        if (!field || typeof field !== 'object' || !hasLocalizedValue(field)) {
            return fallback;
        }

        if (!fallback || typeof fallback !== 'object') {
            return field;
        }

        const normalized = { ...fallback };
        Object.entries(field).forEach(([lang, value]) => {
            if (typeof value === 'string' && value.trim().length > 0) {
                normalized[lang] = value;
            }
        });

        return normalized;
    };

    const getAllGuidesRequest = async (req, res) => {
        try {
            const publishedOnly = req.query.all !== '1';
            const cacheKey = publishedOnly ? 'published' : 'all';
            const cached = guideListCache.get(cacheKey);

            if (cached && moment().diff(cached.updatedAt, 'minutes') < CACHE_TTL_MINUTES) {
                return res.status(cached.status).send({ message: cached.message });
            }

            const result = await getAllGuidesService(publishedOnly);
            if (result.status === 200) {
                guideListCache.set(cacheKey, {
                    status: result.status,
                    message: result.message,
                    updatedAt: moment(),
                });
            }
            return res.status(result.status).send({ message: result.message });
        } catch (err) {
            console.error('GuideController getAllGuidesRequest error:', err);
            return res.status(500).send({ message: 'Internal server error.' });
        }
    };

    const getGuideBySlugRequest = async (req, res) => {
        try {
            const { slug } = req.params;
            if (!slug || !SLUG_REGEX.test(slug)) {
                return res.status(400).send({ message: 'Invalid slug.' });
            }

            const cached = guideSlugCache.get(slug);
            if (cached && moment().diff(cached.updatedAt, 'minutes') < CACHE_TTL_MINUTES) {
                return res.status(cached.status).send({ message: cached.message });
            }

            const result = await getGuideBySlugService(slug);
            if (result.status === 200) {
                guideSlugCache.set(slug, {
                    status: result.status,
                    message: result.message,
                    updatedAt: moment(),
                });
            }
            return res.status(result.status).send({ message: result.message });
        } catch (err) {
            console.error('GuideController getGuideBySlugRequest error:', err);
            return res.status(500).send({ message: 'Internal server error.' });
        }
    };

    const createGuideRequest = async (req, res) => {
        try {
            const { title, section_title, slug, content, menu_label, published } = req.body;

            if (!title || typeof title !== 'object') {
                return res.status(400).send({ message: 'Title is required and must be an object with language keys.' });
            }
            if (!title['pt-BR'] || typeof title['pt-BR'] !== 'string' || title['pt-BR'].trim().length === 0) {
                return res.status(400).send({ message: 'Title in pt-BR is required.' });
            }
            if (!slug || !SLUG_REGEX.test(slug)) {
                return res.status(400).send({ message: 'Invalid slug. Use lowercase letters, numbers and hyphens only.' });
            }
            if (!content || typeof content !== 'object') {
                return res.status(400).send({ message: 'Content is required and must be an object.' });
            }

            const contentStr = JSON.stringify(content);
            if (Buffer.byteLength(contentStr, 'utf8') > MAX_CONTENT_SIZE) {
                return res.status(413).send({ message: CONTENT_TOO_LARGE_MESSAGE });
            }

            const data = {
                title,
                section_title: normalizeLocalizedObject(section_title, title),
                slug,
                content,
                author_id: req.user.data.id,
                menu_label: normalizeLocalizedObjectWithFallback(menu_label, title),
                published: !!published,
            };

            const result = await createGuideService(data);
            if (result.status === 201) invalidateGuideCache();
            return res.status(result.status).send({ message: result.message });
        } catch (err) {
            console.error('GuideController createGuideRequest error:', err);
            return res.status(500).send({ message: 'Internal server error.' });
        }
    };

    const updateGuideRequest = async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                return res.status(400).send({ message: 'Invalid guide ID.' });
            }

            const { title, section_title, slug, content, menu_label, published } = req.body;

            if (slug !== undefined && !SLUG_REGEX.test(slug)) {
                return res.status(400).send({ message: 'Invalid slug.' });
            }
            if (section_title !== undefined && typeof section_title !== 'object') {
                return res.status(400).send({ message: 'Section title must be an object with language keys.' });
            }
            if (content !== undefined) {
                if (typeof content !== 'object') {
                    return res.status(400).send({ message: 'Content must be an object.' });
                }
                const contentStr = JSON.stringify(content);
                if (Buffer.byteLength(contentStr, 'utf8') > MAX_CONTENT_SIZE) {
                    return res.status(413).send({ message: CONTENT_TOO_LARGE_MESSAGE });
                }
            }

            const data = {};
            if (title !== undefined) data.title = title;
            if (section_title !== undefined) data.section_title = section_title;
            if (slug !== undefined) data.slug = slug;
            if (content !== undefined) data.content = content;
            if (menu_label !== undefined) {
                data.menu_label = normalizeLocalizedObjectWithFallback(menu_label, title || undefined);
            }
            if (published !== undefined) data.published = published;
            data.updated_by = req.user.data.id;

            const result = await updateGuideService(id, data);
            if (result.status === 200) invalidateGuideCache();
            return res.status(result.status).send({ message: result.message });
        } catch (err) {
            console.error('GuideController updateGuideRequest error:', err);
            return res.status(500).send({ message: 'Internal server error.' });
        }
    };

    const deleteGuideRequest = async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!id || isNaN(id)) {
                return res.status(400).send({ message: 'Invalid guide ID.' });
            }
            const result = await deleteGuideService(id);
            if (result.status === 200) invalidateGuideCache();
            return res.status(result.status).send({ message: result.message });
        } catch (err) {
            console.error('GuideController deleteGuideRequest error:', err);
            return res.status(500).send({ message: 'Internal server error.' });
        }
    };

    return {
        getAllGuidesRequest,
        getGuideBySlugRequest,
        createGuideRequest,
        updateGuideRequest,
        deleteGuideRequest,
    };
};
