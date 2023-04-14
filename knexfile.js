// Update with your config settings.

require('dotenv/config')

const typeDb = process.env.TYPE_SQL ? process.env.TYPE_SQL : 'mysql'

module.exports = {
  client: typeDb,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
