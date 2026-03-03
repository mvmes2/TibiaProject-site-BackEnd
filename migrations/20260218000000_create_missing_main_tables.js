exports.up = async (knex) => {
  // Create worlds table
  await knex.schema.createTable('worlds', (table) => {
    table.increments('id').primary();
    table.string('serverName', 100).notNullable().unique();
    table.enum('pvptype', ['pvp', 'no-pvp', 'pvp-enforced']).notNullable().defaultTo('pvp');
    table.string('location', 100);
    table.timestamps(true, true);
  });

  // Create players_comment table
  await knex.schema.createTable('players_comment', (table) => {
    table.increments('id').primary();
    table.integer('player_id').notNullable().unique();
    table.text('comment').nullable();
    table.foreign('player_id').references('id').inTable('players').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Create players_titles table
  await knex.schema.createTable('players_titles', (table) => {
    table.increments('id').primary();
    table.integer('player_id').notNullable();
    table.string('title', 100).notNullable();
    table.boolean('in_use').defaultTo(0);
    table.foreign('player_id').references('id').inTable('players').onDelete('CASCADE');
    table.index('player_id');
    table.index('in_use');
    table.timestamps(true, true);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('players_titles');
  await knex.schema.dropTableIfExists('players_comment');
  await knex.schema.dropTableIfExists('worlds');
};
