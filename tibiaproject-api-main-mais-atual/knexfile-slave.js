require('dotenv');
module.exports = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOSTSLAVE,
    user: process.env.DB_USERSLAVE,
    database: process.env.DB_NAMESLAVE,
    password: process.env.DB_PASSSLAVE,
    port: process.env.DB_PORTSLAVE
  },
  pool: {
    min: 1,
    max: 200
  }
}