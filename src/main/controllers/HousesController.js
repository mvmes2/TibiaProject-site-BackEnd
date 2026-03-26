module.exports = app => {
    const { getHouseListService, getHouseByIdService } = app.src.main.services.HousesService;
    const moment = require('moment');

    const houseListControllerCache = new Map();
    const houseDetailsControllerCache = new Map();
    const CACHE_TTL_MINUTES = 5;

    const getHouseListRequest = async (req, res) => {
        const townId = req.query.town_id ? Number(req.query.town_id) : null;
        const worldId = req.query.world_id ? Number(req.query.world_id) : null;

        if (req.query.town_id && Number.isNaN(townId)) {
            return res.status(400).send({ message: 'town_id must be a valid number.' });
        }

        if (req.query.world_id && Number.isNaN(worldId)) {
            return res.status(400).send({ message: 'world_id must be a valid number.' });
        }

        const cacheKey = `town:${townId || 'all'}|world:${worldId || 'all'}`;
        const cached = houseListControllerCache.get(cacheKey);

        if (cached && moment().diff(cached.updatedAt, 'minutes') < CACHE_TTL_MINUTES) {
            return res.status(cached.status).send({ message: cached.message });
        }

        const result = await getHouseListService(townId, worldId);
        if (result.status === 200) {
            houseListControllerCache.set(cacheKey, {
                status: result.status,
                message: result.message,
                updatedAt: moment(),
            });
        }

        return res.status(result.status).send({ message: result.message });
    };

    const getHouseByIdRequest = async (req, res) => {
        const id = req.query.id ? Number(req.query.id) : null;
        if (!id) return res.status(400).send({ message: 'House ID is required.' });

        const cacheKey = String(id);
        const cached = houseDetailsControllerCache.get(cacheKey);

        if (cached && moment().diff(cached.updatedAt, 'minutes') < CACHE_TTL_MINUTES) {
            return res.status(cached.status).send({ message: cached.message });
        }

        const result = await getHouseByIdService(id);
        if (result.status === 200) {
            houseDetailsControllerCache.set(cacheKey, {
                status: result.status,
                message: result.message,
                updatedAt: moment(),
            });
        }

        return res.status(result.status).send({ message: result.message });
    };

    return { getHouseListRequest, getHouseByIdRequest };
};
