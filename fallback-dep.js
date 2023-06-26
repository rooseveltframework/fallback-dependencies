if (module.parent) {
  module.exports = {
    fallbackSandBox
  }
} else {
  fallbackSandBox()
}

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

      process.chdir('./test/repos/repo1')

      execSync('git --bare init',
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
        })

      process.chdir(`${rootPath}/test/clones`)

      execSync(`git clone ${rootPath}/test/repos/repo1`,
        function (error) {
          if (error !== null) {
            console.log('exec error: ' + error)
          }
        })

      process.chdir(`${rootPath}/test/clones/repo1`)

      const clonesRepo1Package = {
        devDependencies: {
          'fallback-dependencies': '../../../'
        },
        fallbackDependencies: {
          dir: 'lib',
          repos: {
            'fallback-deps-test-repo-2': [
              '../../../repos/repo2'
            ]
          }
        },
        scripts: {
          postinstall: 'node node_modules/fallback-dependencies/fallback-dependencies.js'
        }
      }

      fs.writeFileSync(`${rootPath}/test/clones/repo1/package.json`, JSON.stringify(clonesRepo1Package))

      try {
        execSync('git add package.json')
        execSync('git commit -m "commit"')
        execSync('git push')
      } catch (err) {
        console.log(err)
      }

      process.chdir(`${rootPath}/test/clones/repo1`)

      const clonesRepo1LockedPackage = {
        name: 'repo1',
        lockfileVersion: 3,
        requires: true,
        packages: {
          '': {
            hasInstallScript: true,
            devDependencies: {
              'fallback-dependencies': '../../../'
            }
          },
          '../../..': {
            version: '0.1.0',
            dev: true,
            license: 'CC-BY-4.0',
            devDependencies: {}
          },
          'node_modules/fallback-dependencies': {
            resolved: '../../..',
            link: true
          }
        }
      }

      fs.writeFileSync(`${rootPath}/test/clones/repo1/package-lock.json`, JSON.stringify(clonesRepo1LockedPackage))

      try {
        execSync('git add package-lock.json')
        execSync('git commit -m "commit"')
        execSync('git push')
      } catch (err) {
        console.log(err)
      }
      console.log('Present working directory: ' + process.cwd())
    }
  } catch (e) { console.log(e) }
}
