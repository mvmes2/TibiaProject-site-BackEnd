const { guides } = require('../models/MasterModels');

module.exports = app => {
    const getAllGuidesFromDB = async (publishedOnly = true) => {
        try {
            const query = guides.query()
                .select(
                    'guides.id', 'guides.title', 'guides.slug', 'guides.menu_label',
                    'guides.published', 'guides.created_at', 'guides.updated_at',
                    'creator.name as author_name', 'creator.email as author_email',
                    'updater.name as updater_name', 'updater.email as updater_email'
                )
                .leftJoin('accounts as creator', 'guides.author_id', 'creator.id')
                .leftJoin('accounts as updater', 'guides.updated_by', 'updater.id');
            if (publishedOnly) {
                query.where('published', 1);
            }
            const result = await query.orderBy('created_at', 'desc');
            return { status: 200, message: result };
        } catch (err) {
            console.error('GuideRepository getAllGuidesFromDB error:', err);
            return { status: 500, message: 'Error fetching guides.' };
        }
    };

    const getGuideBySlugFromDB = async (slug) => {
        try {
            const result = await guides.query().where('slug', slug).first();
            if (!result) {
                return { status: 404, message: 'Guide not found.' };
            }
            return { status: 200, message: result };
        } catch (err) {
            console.error('GuideRepository getGuideBySlugFromDB error:', err);
            return { status: 500, message: 'Error fetching guide.' };
        }
    };

    const createGuideInDB = async (data) => {
        try {
            const now = Math.floor(Date.now() / 1000);
            const result = await guides.query().insert({
                title: JSON.stringify(data.title),
                section_title: JSON.stringify(data.section_title || data.title),
                slug: data.slug,
                content: JSON.stringify(data.content),
                author_id: data.author_id,
                menu_label: JSON.stringify(data.menu_label || data.title),
                published: data.published ? 1 : 0,
                created_at: now,
                updated_at: now,
            });
            return { status: 201, message: result };
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return { status: 409, message: 'A guide with this slug already exists.' };
            }
            console.error('GuideRepository createGuideInDB error:', err);
            return { status: 500, message: 'Error creating guide.' };
        }
    };

    const updateGuideInDB = async (id, data) => {
        try {
            const now = Math.floor(Date.now() / 1000);
            const updateObj = { updated_at: now };
            if (data.title !== undefined) updateObj.title = JSON.stringify(data.title);
            if (data.section_title !== undefined) updateObj.section_title = JSON.stringify(data.section_title);
            if (data.slug !== undefined) updateObj.slug = data.slug;
            if (data.content !== undefined) updateObj.content = JSON.stringify(data.content);
            if (data.menu_label !== undefined) updateObj.menu_label = JSON.stringify(data.menu_label);
            if (data.published !== undefined) updateObj.published = data.published ? 1 : 0;
            if (data.updated_by !== undefined) updateObj.updated_by = data.updated_by;

            const rows = await guides.query().patchAndFetchById(id, updateObj);
            if (!rows) {
                return { status: 404, message: 'Guide not found.' };
            }
            return { status: 200, message: rows };
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return { status: 409, message: 'A guide with this slug already exists.' };
            }
            console.error('GuideRepository updateGuideInDB error:', err);
            return { status: 500, message: 'Error updating guide.' };
        }
    };

    const deleteGuideFromDB = async (id) => {
        try {
            const deleted = await guides.query().deleteById(id);
            if (!deleted) {
                return { status: 404, message: 'Guide not found.' };
            }
            return { status: 200, message: 'Guide deleted.' };
        } catch (err) {
            console.error('GuideRepository deleteGuideFromDB error:', err);
            return { status: 500, message: 'Error deleting guide.' };
        }
    };

    return {
        getAllGuidesFromDB,
        getGuideBySlugFromDB,
        createGuideInDB,
        updateGuideInDB,
        deleteGuideFromDB,
    };
};
