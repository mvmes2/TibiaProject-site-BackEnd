module.exports = app => {
    const { getPlayersOnline } = app.src.main.repository.PlayersOnline;
    const TesteService = async () => {
        const resp = await getPlayersOnline();
    return { status: 200, data: resp};
}
    return {
        TesteService,
    }
}