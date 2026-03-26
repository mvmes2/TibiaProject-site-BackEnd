module.exports = app => {
    const { getHouseListFromDB, getHouseByIdFromDB } = app.src.main.repository.HousesRepository;

    const getHouseListService = async (townId = null, worldId = null) => {
        const resp = await getHouseListFromDB(townId, worldId);
        return { status: resp.status, message: resp.message };
    };

    const getHouseByIdService = async (houseId) => {
        const resp = await getHouseByIdFromDB(houseId);
        return { status: resp.status, message: resp.message };
    };

    return { getHouseListService, getHouseByIdService };
};
