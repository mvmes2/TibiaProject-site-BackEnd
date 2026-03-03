exports.up = async (knex) => {
  // Add missing columns to players table
  await knex.schema.alterTable('players', (table) => {
    table.boolean('hidden').defaultTo(0);
    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.integer('deletedAt').unsigned().defaultTo(0);
  });
};

exports.down = async (knex) => {
  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('hidden');
    table.dropColumn('createdAt');
    table.dropColumn('deletedAt');
  });
};
