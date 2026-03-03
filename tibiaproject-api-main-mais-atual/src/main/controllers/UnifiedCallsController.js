module.exports = app => {
	const { AdminGetAllCupomsFromDB } = app.src.main.repository.AdminRepository;
	const { getProductsList, GetPaymentListLastIDRepository } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;
	const { AdminGetRedeemCupomStorageAtDB } = app.src.main.repository.AdminRepository;


	const getProductsToDonateCoinsTableUnifiedCallController = async (req, res) => {

		const productsList = await getProductsList();

		const getNextPaymentId = await GetPaymentListLastIDRepository();

		const getAllCupoms = await AdminGetAllCupomsFromDB();

		const getReedemedCupons = await AdminGetRedeemCupomStorageAtDB();

		const unifiedResponse = {
			productsList: productsList?.message,
			nextPaymentID: getNextPaymentId.message,
			cupoms: getAllCupoms.data,
			redeemedCupoms: getReedemedCupons.data
		}

		return res.status(productsList?.status ? productsList?.status : 500).send(unifiedResponse);
	}


	return {
		getProductsToDonateCoinsTableUnifiedCallController,
	}
}