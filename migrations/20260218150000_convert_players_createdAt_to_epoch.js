exports.up = async (knex) => {
  const hasCreatedAt = await knex.schema.hasColumn('players', 'createdAt');
  if (!hasCreatedAt) {
    await knex.schema.alterTable('players', (table) => {
      table.integer('createdAt').unsigned().notNullable().defaultTo(0);
    });
    return;
  }

  await knex.schema.alterTable('players', (table) => {
    table.integer('createdAt_epoch').unsigned().nullable();
  });

  await knex.raw('UPDATE players SET createdAt_epoch = COALESCE(UNIX_TIMESTAMP(createdAt), 0)');

  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('createdAt');
  });

  await knex.schema.alterTable('players', (table) => {
    table.integer('createdAt').unsigned().notNullable().defaultTo(0);
  });

  await knex.raw('UPDATE players SET createdAt = COALESCE(createdAt_epoch, 0)');

  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('createdAt_epoch');
  });
};

exports.down = async (knex) => {
  const hasCreatedAt = await knex.schema.hasColumn('players', 'createdAt');
  if (!hasCreatedAt) {
    return;
  }

  await knex.schema.alterTable('players', (table) => {
    table.timestamp('createdAt_ts').nullable();
  });

  await knex.raw('UPDATE players SET createdAt_ts = FROM_UNIXTIME(createdAt)');

  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('createdAt');
  });

  await knex.schema.alterTable('players', (table) => {
    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });

  await knex.raw('UPDATE players SET createdAt = COALESCE(createdAt_ts, CURRENT_TIMESTAMP)');

  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('createdAt_ts');
  });
};
