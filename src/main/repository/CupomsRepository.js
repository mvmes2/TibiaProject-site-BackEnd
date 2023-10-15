const { cupoms } = require("../models/SlaveModels");

const getCupomByID = async (data) => {
    console.log('Como ta chegando a DAta em ProductsRepository??? ', data);
    if (!data?.id) {
        console.log('Sem Id para consulta em getCupomByID em CupomsRepository');
        return { status: 400, message: 'Sem Id para consulta em getCupomByID em CupomsRepository' };
    }
    try {
        const cumpomID = Number(data.id);
        const cupom = await cupoms().select('*').where({ id: cumpomID }).first();
        return { status: 200, data: cupom };
    } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal Error!' };
    }
}

module.exports = {
    getCupomByID,
    
  }