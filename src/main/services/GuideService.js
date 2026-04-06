module.exports = app => {
    const {
        getAllGuidesFromDB,
        getGuideBySlugFromDB,
        createGuideInDB,
        updateGuideInDB,
        deleteGuideFromDB,
    } = app.src.main.repository.GuideRepository;

    const getAllGuidesService = async (publishedOnly) => {
        return await getAllGuidesFromDB(publishedOnly);
    };

    const getGuideBySlugService = async (slug) => {
        return await getGuideBySlugFromDB(slug);
    };

    const createGuideService = async (data) => {
        return await createGuideInDB(data);
    };

    const updateGuideService = async (id, data) => {
        return await updateGuideInDB(id, data);
    };

    const deleteGuideService = async (id) => {
        return await deleteGuideFromDB(id);
    };

    return {
        getAllGuidesService,
        getGuideBySlugService,
        createGuideService,
        updateGuideService,
        deleteGuideService,
    };
};
