exports.up = async (knex) => {
  const hasEmailVerified = await knex.schema.hasColumn('accounts', 'email_verified');
  const hasCreated = await knex.schema.hasColumn('accounts', 'created');

  await knex.schema.alterTable('accounts', (table) => {
    if (!hasEmailVerified) {
      table.boolean('email_verified').defaultTo(0);
    }
    if (!hasCreated) {
      table.boolean('created').defaultTo(0);
    }
  });
};

exports.down = async (knex) => {
  const hasEmailVerified = await knex.schema.hasColumn('accounts', 'email_verified');
  const hasCreated = await knex.schema.hasColumn('accounts', 'created');

  await knex.schema.alterTable('accounts', (table) => {
    if (hasEmailVerified) {
      table.dropColumn('email_verified');
    }
    if (hasCreated) {
      table.dropColumn('created');
    }
  });
};
