exports.up = async (knex) => {
  // Add world_id to players table (CRITICAL - needed for joins)
  await knex.schema.alterTable('players', (table) => {
    table.integer('world_id').unsigned().nullable();
    table.foreign('world_id').references('id').inTable('worlds').onDelete('SET NULL');
  });

  // Add missing columns to accounts table
  await knex.schema.alterTable('accounts', (table) => {
    table.string('country', 100).nullable().defaultTo(null);
    table.string('loginHash', 100).nullable().defaultTo(null);
    table.boolean('isBanned').defaultTo(0);
    table.string('banReason', 255).nullable().defaultTo(null);
    table.bigInteger('day_end_premmy').defaultTo(0);
    table.bigInteger('web_lastlogin').defaultTo(0);
    table.string('web_flags', 255).nullable().defaultTo(null);
    table.string('change_pass_token', 255).nullable().defaultTo(null);
    table.string('recovery_key', 100).nullable().defaultTo(null);
    table.string('password2', 100).nullable().defaultTo(null);
    table.string('login_token', 500).nullable().defaultTo(null);
  });
};

exports.down = async (knex) => {
  // Remove columns from accounts table
  await knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('country');
    table.dropColumn('loginHash');
    table.dropColumn('isBanned');
    table.dropColumn('banReason');
    table.dropColumn('day_end_premmy');
    table.dropColumn('web_lastlogin');
    table.dropColumn('web_flags');
    table.dropColumn('change_pass_token');
    table.dropColumn('recovery_key');
    table.dropColumn('password2');
    table.dropColumn('login_token');
  });

  // Remove world_id from players table
  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('world_id');
  });
};
