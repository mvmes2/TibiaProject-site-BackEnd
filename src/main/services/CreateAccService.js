
module.exports = app => {
    const { InsertNewAccount } = app.src.main.repository.UserRepository;

    const CreateAccService = async (data) => {
        const resp = await InsertNewAccount(data);
        console.log(resp.status)
    return { status: resp.status, message: resp.message};
}
    return {
        CreateAccService,
    }
}