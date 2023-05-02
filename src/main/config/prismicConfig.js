
require('dotenv/config')// node-fetch is used to make network requests to the Prismic Rest API. 
// In Node.js Prismic projects, you must provide a fetch method to the
// Prismic client.
require('dotenv/config')
const fetch = require('node-fetch')
const prismic = require('@prismicio/client')

const repoName = 'tibiaproject' // Fill in your repository name.
const accessToken = process.env.ACCESS_TOKEN_PRISMIC_IO // If your repository is private, add an access token.

module.exports = (app) => {
  const client = prismic.createClient(repoName, { 
    fetch, 
    accessToken,
  })

  return {
    client
  }
}