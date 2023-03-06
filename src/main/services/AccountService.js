module.exports = app => {
    const { validateLoginHash, createNewCharacterDB, checkCharacterOwnerAtDB } = app.src.main.repository.UserRepository;
    const { deleteCharacter, updateHidenCharacterInDB, updateCharacterCommentInDB } = app.src.main.repository.AccountRepository;

    const checkValidLoginHash = async (data) => {
        const resp = await validateLoginHash(data);
    return { status: resp.status, message: resp.message};
}

const createCharacterSerice = async (data) => {

    const resp = await createNewCharacterDB(data);
return { status: resp.status, message: resp.message};
}

const validateCharacterService = async (data) => {
    const resp = await checkCharacterOwnerAtDB(data);
return { status: resp.status, message: resp.message};
}

const deleteCharacterService = async (data) => {
    const resp = await deleteCharacter(data);
return { status: resp.status, message: resp.message};
}

const updateHidenCharacterService = async (data) => {
    const resp = await updateHidenCharacterInDB(data);
return { status: resp.status, message: resp.message};
}

const updateCharacterCommentService = async (data) => {
    const resp = await updateCharacterCommentInDB(data);
return { status: resp.status, message: resp.message};
}

    return {
        checkValidLoginHash,
        createCharacterSerice,
        validateCharacterService,
        deleteCharacterService,
        updateHidenCharacterService,
        updateCharacterCommentService
    }
}