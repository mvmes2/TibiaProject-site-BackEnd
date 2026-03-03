exports.up = async (knex) => {
  await knex.schema.alterTable('accounts', (table) => {
    table.integer('createdAt').unsigned().defaultTo(0);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('createdAt');
  });
};
