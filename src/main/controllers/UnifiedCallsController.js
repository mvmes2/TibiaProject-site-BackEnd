module.exports = app => {
	const { AdminGetAllCupomsFromDB } = app.src.main.repository.AdminRepository;
	const { getProductsList, GetPaymentListLastIDRepository } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;
	const { AdminGetRedeemCupomStorageAtDB } = app.src.main.repository.AdminRepository;


	const getProductsToDonateCoinsTableUnifiedCallController = async (req, res) => {
		const productsList = await getProductsList();
		const getNextPaymentId = await GetPaymentListLastIDRepository();
		const getAllCupoms = await AdminGetAllCupomsFromDB();
		const getReedemedCupons = await AdminGetRedeemCupomStorageAtDB();

		const statuses = [
			productsList?.status,
			getNextPaymentId?.status,
			getAllCupoms?.status,
			getReedemedCupons?.status
		].filter((status) => Number(status) !== 200);

		const unifiedResponse = {
			productsList: productsList?.message || productsList?.data || [],
			nextPaymentID: getNextPaymentId?.message || getNextPaymentId?.data || 1,
			cupoms: getAllCupoms?.data || getAllCupoms?.message || [],
			redeemedCupoms: getReedemedCupons?.data || getReedemedCupons?.message || []
		}

		return res.status(statuses?.[0] ? statuses[0] : 200).send(unifiedResponse);
	}


	return {
		getProductsToDonateCoinsTableUnifiedCallController,
	}
}