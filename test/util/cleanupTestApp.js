const fs = require('fs')

module.exports = function (appDir, next) {
  // use regexp to check appDir included 'test/app', ensure nothing deleted outside Roosevelt test folder
  if (/test[\\/]app/.test(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true })
    next()
  } else {
    next(new Error(`Directory ${appDir} is not a test app and will not be deleted.`))
  }
}
