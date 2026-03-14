// Guildhall IDs extracted from houses.xml (guildhall="true")
const GUILDHALL_IDS = [
    1, 2, 3, 4, 5, 58, 71, 77, 111, 112, 120, 122, 123, 133, 134, 135, 136,
    193, 219, 225, 228, 242, 243, 244, 245, 314, 315, 316, 331, 332, 333, 334,
    335, 336, 396, 397, 408, 409, 514, 515, 516, 603, 604, 605, 607, 635, 662,
    710, 731, 777, 787, 856, 857
];

exports.up = async (knex) => {
    const hasColumn = await knex.schema.hasColumn('houses', 'guildhall');
    if (!hasColumn) {
        await knex.schema.alterTable('houses', (table) => {
            table.tinyint('guildhall').notNullable().defaultTo(0);
        });
    }

    if (GUILDHALL_IDS.length > 0) {
        await knex('houses').whereIn('id', GUILDHALL_IDS).update({ guildhall: 1 });
    }
};

exports.down = async (knex) => {
    const hasColumn = await knex.schema.hasColumn('houses', 'guildhall');
    if (hasColumn) {
        await knex.schema.alterTable('houses', (table) => {
            table.dropColumn('guildhall');
        });
    }
};
