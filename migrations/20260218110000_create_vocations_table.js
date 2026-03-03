exports.up = async (knex) => {
  // Create vocations table - Tibia vocations
  await knex.schema.createTable('vocations', (table) => {
    table.integer('vocation_id').unsigned().primary();
    table.string('vocation_name', 100).notNullable().unique();
    table.text('description').nullable();
    table.timestamps(true, true);
  });

  // Insert default Tibia vocations
  await knex('vocations').insert([
    { vocation_id: 0, vocation_name: 'None', description: 'No vocation' },
    { vocation_id: 1, vocation_name: 'Sorcerer', description: 'Master of fire and energy' },
    { vocation_id: 2, vocation_name: 'Druid', description: 'Master of nature and healing' },
    { vocation_id: 3, vocation_name: 'Paladin', description: 'Master of ranged combat and healing' },
    { vocation_id: 4, vocation_name: 'Knight', description: 'Master of close combat and defense' }
  ]);
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists('vocations');
};
