const { products } = require("../models/SlaveModels");

const getProductsByID = async (data) => {
    console.log('Como ta chegando a DAta em ProductsRepository??? ', data);
    if (!data?.id) {
        console.log('Sem Id para consulta em getProductsByID em ProductsRepository');
        return { status: 400, message: 'Sem Id para consulta em getProductsByID em ProductsRepository' };
    }
    try {
        const productID = Number(data.id);
        const product = await products().select('*').where({ id: productID }).first();
        return { status: 200, data: product };
    } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal Error!' }
    }
}

module.exports = {
    getProductsByID,
    
  }