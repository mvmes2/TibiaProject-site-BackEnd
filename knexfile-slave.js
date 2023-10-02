module.exports = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    database: 'tibiaprojectslave',
    user: 'root',
    password: 'root'
  },
  pool: {
    min: 2,
    max: 10
  }
}