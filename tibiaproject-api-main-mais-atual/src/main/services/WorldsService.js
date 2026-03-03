module.exports = app => {
  const { getWorldListFromDB, getAllWorldsCharactersFromDB } = app.src.main.repository.WorldsRepository;

  const GetWorldsListService = async () => {
    const resp = await getWorldListFromDB();
    return { status: resp.status, message: resp.message };
  }

  const getAllWorldsCharactersService = async () => {
    const resp = await getAllWorldsCharactersFromDB();
    return { status: resp.status, message: resp.message };
  }
  return {
    GetWorldsListService,
    getAllWorldsCharactersService
  }
}