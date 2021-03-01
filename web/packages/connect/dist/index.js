
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./connect.cjs.production.min.js')
} else {
  module.exports = require('./connect.cjs.development.js')
}
