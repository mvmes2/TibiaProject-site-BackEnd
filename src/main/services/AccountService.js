module.exports = app => {
    const { validateLoginHash } = app.src.main.repository.UserRepository;

    const checkValidLoginHash = async (data) => {
        const resp = await validateLoginHash(data);
    return { status: resp.status, message: resp.message};
}
    return {
        checkValidLoginHash,
    }
}