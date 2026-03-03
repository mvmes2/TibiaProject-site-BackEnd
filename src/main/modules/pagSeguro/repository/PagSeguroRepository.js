/**
 * PagSeguroRepository.js
 * 
 * Repository para integração com PagSeguro
 * Responsável por operações de banco de dados relacionadas a pagamentos via PagSeguro
 */

const { payments } = require('../../../models/SlaveModels');

/**
 * Insere um novo pagamento do PagSeguro no banco de dados
 * @param {Object} data - Dados do pagamento
 * @returns {Object} - Status e mensagem da operação
 */
const insertNewPagSeguroPayment = async (data) => {
  try {
    console.log('Inserindo pagamento PagSeguro:', data);
    await payments().insert(data);
    return { status: 201, message: 'Created new PagSeguro payment' };
  } catch (err) {
    console.log('Erro ao inserir pagamento PagSeguro:', err);
    return { status: 500, message: 'Internal error!' };
  }
};

/**
 * Atualiza status de um pagamento do PagSeguro
 * @param {Object} data - Dados da atualização { transaction_id, update }
 * @returns {Object} - Status e mensagem da operação
 */
const updatePagSeguroPayment = async (data) => {
  try {
    await payments().update(data.update).where({ transaction_id: data.transaction_id });
    return { status: 200, message: 'Payment updated successfully' };
  } catch (err) {
    console.log('Erro ao atualizar pagamento PagSeguro:', err);
    return { status: 500, message: 'Internal error!' };
  }
};

module.exports = {
  insertNewPagSeguroPayment,
  updatePagSeguroPayment
};
