exports.up = async (knex) => {
  const hasCreatedAtCamel = await knex.schema.hasColumn('players', 'createdAt');
  const hasCreatedAtSnake = await knex.schema.hasColumn('players', 'created_at');

  if (hasCreatedAtCamel && !hasCreatedAtSnake) {
    await knex.schema.alterTable('players', (table) => {
      table.renameColumn('createdAt', 'created_at');
    });
  }
};

exports.down = async (knex) => {
  const hasCreatedAtSnake = await knex.schema.hasColumn('players', 'created_at');
  const hasCreatedAtCamel = await knex.schema.hasColumn('players', 'createdAt');

  if (hasCreatedAtSnake && !hasCreatedAtCamel) {
    await knex.schema.alterTable('players', (table) => {
      table.renameColumn('created_at', 'createdAt');
    });
  }
};
