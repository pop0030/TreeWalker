const fs  = require('fs')
const jsdom = require("jsdom")
const html = require("js-beautify").html
const { JSDOM } = jsdom
const Entities = require('html-entities').AllHtmlEntities
const ent = new Entities()

const { devMode }     = require('./envSetting.js')
const htmlFileHandler = require('./htmlFileHandler.js')
const lsDirPath       = "data/list/lsDir.txt"
const pathDIR         = (devMode) ? require('./path_L10N_demo.js') : require('./path_L10N.js');
const ls              = (devMode) ? "data/list/demo-ls.txt" : "data/list/ls.txt"
const resDir          = (devMode) ? "resultDemo" : "result"

replaceLAN('tw-new')

async function replaceLAN(LAN) {
    //await createFolders(LAN)
    await createFolders(`${resDir}/html[${LAN}]/`)
    fs.readFile(ls, (err, data) => {
    if (err) return console.error(err)
        const compareFiles = data.toString().split('\n');
        let counter = { total: 0, success : 0, err : 0, errList : [] }
        compareFiles.forEach( async filePath => {
            if ( filePath.indexOf('.js') > 0 || filePath.indexOf('.css') > 0 ) return
            // Single Mode
            let result = await htmlFileHandler(pathDIR[`WFBS10_new`] + filePath, LAN, `[${encodeURIComponent(filePath).replace(/%2F/g, '][')}]`)
            fs.writeFileSync(`${resDir}/html[${LAN}]/${filePath}`, result.doc)
        })
    })
}

function createFolders(root) {
    return new Promise(  (resolve, reject)=> {
        fs.readFile(lsDirPath, (err, data)=> {
            lsDir = data.toString().split('\n')
            lsDir.forEach( async dir => { await createFolder(root, dir) })
            resolve()
        })
    })
}

function createFolder(root, dir) {
    return new Promise( (resolve, reject) => {
        fs.mkdir(root+dir, err => {
            if (err && err.errno == -2) {
                createFolder(root, dir)
            }
            resolve({})
        })
    })
}