module.exports = app => {
    const { houses } = require('../models/MasterModels');
    const { players } = require('../models/MasterModels');

    const houseListCache = new Map();
    const houseDetailsCache = new Map();
    const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    const _selectHouseColumns = () => [
        'houses.id',
        'houses.world_id',
        'houses.name',
        'houses.rent',
        'houses.project_coins',
        'houses.size',
        'houses.beds',
        'houses.guildhall as housetype',
        'houses.town_id',
        'houses.entryx as entry_x',
        'houses.entryy as entry_y',
        'houses.entryz as entry_z',
        'players.name as owner_name'
    ];

    const getHouseListFromDB = async (townId = null, worldId = null) => {
        const cacheKey = `town:${townId || 'all'}|world:${worldId || 'all'}`;
        const now = Date.now();
        const cached = houseListCache.get(cacheKey);

        if (cached && (now - cached.updatedAt) <= CACHE_TTL_MS) {
            return { status: 200, message: cached.data };
        }

        try {
            let query = houses.query()
                .leftJoin('players', 'houses.owner', '=', 'players.id')
                .select(_selectHouseColumns());

            if (townId) {
                query = query.where('houses.town_id', townId);
            }

            if (worldId) {
                query = query.where('houses.world_id', worldId);
            }

            const result = await query.orderBy('houses.name', 'asc');

            houseListCache.set(cacheKey, { data: result, updatedAt: now });
            return { status: 200, message: result };
        } catch (err) {
            console.log('[HousesRepository] getHouseListFromDB error:', err);
            return { status: 500, message: 'Internal error, please try again later.' };
        }
    };

    const getHouseByIdFromDB = async (houseId) => {
        const cacheKey = String(houseId);
        const now = Date.now();
        const cached = houseDetailsCache.get(cacheKey);

        if (cached && (now - cached.updatedAt) <= CACHE_TTL_MS) {
            return { status: 200, message: cached.data };
        }

        try {
            const house = await houses.query()
                .leftJoin('players', 'houses.owner', '=', 'players.id')
                .select(_selectHouseColumns())
                .where('houses.id', houseId)
                .first();

            if (!house) return { status: 404, message: 'House not found.' };

            houseDetailsCache.set(cacheKey, { data: house, updatedAt: now });
            return { status: 200, message: house };
        } catch (err) {
            console.log('[HousesRepository] getHouseByIdFromDB error:', err);
            return { status: 500, message: 'Internal error, please try again later.' };
        }
    };

    return { getHouseListFromDB, getHouseByIdFromDB };
};
