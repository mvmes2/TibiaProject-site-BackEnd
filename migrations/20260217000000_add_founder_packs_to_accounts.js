/**
 * Migration: Add Founder Packs Columns to Accounts
 * 
 * Descrição: Adiciona as colunas necessárias para suportar Founder's Packs
 * Colunas adicionadas:
 *   - silver_pack: Quantidade de Silver Founder's Packs
 *   - gold_pack: Quantidade de Gold Founder's Packs
 *   - diamond_pack: Quantidade de Diamond Founder's Packs
 * 
 * Referência: Usado em src/main/modules/mercadoPago/repository/MercadoPagoRepository.js:113
 */

exports.up = async function (knex) {
  return knex.schema.table('accounts', function (table) {
    table.integer('silver_pack').nullable().defaultTo(0).comment('Silver Founder Pack count');
    table.integer('gold_pack').nullable().defaultTo(0).comment('Gold Founder Pack count');
    table.integer('diamond_pack').nullable().defaultTo(0).comment('Diamond Founder Pack count');
  });
};

exports.down = async function (knex) {
  return knex.schema.table('accounts', function (table) {
    table.dropColumn('silver_pack');
    table.dropColumn('gold_pack');
    table.dropColumn('diamond_pack');
  });
};
