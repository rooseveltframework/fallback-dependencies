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
  const { execSync } = require('child_process')
  const rootPath = __dirname
  const path = require('path')
  if (!appDir) {
    let processEnv
    if (fs.existsSync(path.join(process.cwd(), 'node_modules')) === false) {
      processEnv = process.cwd()
    } else {
      processEnv = undefined
    }
    appDir = processEnv
  }
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

      if (fs.existsSync('./test/repos/repo1')) {
        process.chdir('./test/repos/repo1')
      }

      execSync('git --bare init',
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
        })

      // process.chdir(path)
      if (fs.existsSync(`${rootPath}/test/clones`)) {
        process.chdir(`${rootPath}/test/clones`)
      }

      execSync(`git clone ${rootPath}/test/repos/repo1`,
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
        })
    // console.log('Present working directory: ' + process.cwd())
    }
  } catch (e) { console.log(e) }
}
