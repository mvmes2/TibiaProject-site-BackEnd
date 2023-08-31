exports.up = async function (knex) {
    await knex.schema.table('accounts', function (table) {
      table.integer('silver_pack').nullable().defaultTo(0);
      table.integer('gold_pack').nullable().defaultTo(0);
      table.integer('diamond_pack').nullable().defaultTo(0);
    });
  };
  
  exports.down = async function (knex) {
    await knex.schema.table('stage1_faixa_pessoafisica', function (table) {
      table.dropColumn('silver_pack');
      table.dropColumn('gold_pack');
      table.dropColumn('diamond_pack');
    });
  };