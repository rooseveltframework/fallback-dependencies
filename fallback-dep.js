if (module.parent) {
  module.exports = {
    fallbackSandBox
  }
} else {
  fallbackSandBox()
}
// const path = require('path')

function fallbackSandBox (appDir) {
  const fs = require('fs')

  const reposFolder = './test/repos'
  const clonesFolder = './test/clones'

  // Checks if the repos folder exist, if not it creates it
  try {
    if (!fs.existsSync(reposFolder)) {
      // creat the repos folder in the test folder
      fs.mkdirSync('./test/repos/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the clone folder exist, if not it creates it
    if (!fs.existsSync(clonesFolder)) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./test/clones/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
    // Checks if the repo1 folder exist, if not it creates it
    if (!fs.existsSync('./test/repos/repo1')) {
    // creat the clones folder in the test folder
      fs.mkdirSync('./test/repos/repo1/', err => {
        if (err) {
          console.error(err)
        }
        // file written successfully
      })
    }
  } catch (e) { console.log(e) }
}
