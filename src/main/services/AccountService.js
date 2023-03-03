module.exports = app => {
    const { validateLoginHash, createNewCharacterDB } = app.src.main.repository.UserRepository;

    const checkValidLoginHash = async (data) => {
        const resp = await validateLoginHash(data);
    return { status: resp.status, message: resp.message};
}

const createCharacterSerice = async (data) => {

    const resp = await createNewCharacterDB(data);
return { status: resp.status, message: resp.message};
}
    return {
        checkValidLoginHash,
        createCharacterSerice
    }
}