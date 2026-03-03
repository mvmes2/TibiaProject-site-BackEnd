
module.exports = app => {

    const UploadCupomPaymentProof = async (req, res) => {
        const files = req.files;
        const data = req.body
        console.log("arquivos...: ", files);
        console.log("infos...: ", data);
        const resp = await CreateNewTicketInDB(data, files)
        res.status(resp.status).send({ message: resp.message });
    }

    return {
        UploadCupomPaymentProof
    }
}