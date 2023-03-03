module.exports = app => {
  const { getWorldListFromDB } = app.src.main.repository.WorldsRepository;

  const GetWorldsListService = async () => {
    const resp = await getWorldListFromDB();
    return { status: resp.status, message: resp.message };
  }
  return {
    GetWorldsListService,
  }
}