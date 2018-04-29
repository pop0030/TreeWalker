const fs = require('fs')

const patchOrignDir = "patch/TW95patch"
const l10nJsonDir   = "result/json[tw]"
const ls            = "data/list/ls.txt"
const lsDirPath     = "data/list/lsDir.txt"
const resDir        = "patch/result"

patchReplace('tw')

async function patchReplace(LAN) {
    //await createFolders(LAN)
    await createFolders(`${resDir}/patch[${LAN}]/`)
    fs.readFile(ls, (err, data) => {
    if (err) return console.error(err)
        const compareFiles = data.toString().split('\n');
        let counter = { total: 0, success : 0, err : 0, errList : [] }
        compareFiles.forEach( async filePath => {
            if ( filePath.indexOf('#') > 0 ) return
            let resPatch
            // Handle files
            if ( filePath.indexOf('.htm') > 0 ) { 
                resPatch = await handlePatchFile( filePath )
             } else {
                resPatch = await copyPatchFile( filePath )
             }
             writeFile(`${resDir}/patch[${LAN}]/${filePath}.patch`, resPatch)
        })
    })
}

function handlePatchFile( filePath ) {
    return new Promise( (resolve, reject)=> {
        fs.readFile( `${patchOrignDir}/${filePath}.patch` , async (err, data) => {
            if (err) return console.log(err)
            let patch = data.toString()
            let l10n  = await getL10nJson(`[V][${encodeURIComponent(filePath).replace(/%2F/g, '][')}].json`)
            
            console.log('@ ' + filePath)
            for ( key in l10n) {
                if ( l10n[key].key.length = l10n[key].str.length) {
                    l10n[key].key.forEach( (val, index) => {
                        if (val != null && l10n[key].str[index] && val!=l10n[key].str[index]) {
                            //console.log(`${val} ===> ${l10n[key].str[index]}`)
                            let reg = new RegExp(val, 'gm')
                            let patchMatch = patch.match(reg)
                            if ( patchMatch && patchMatch.length == 1) {
                                patch = patch.replace(reg, l10n[key].str[index])
                                //console.log(patchMatch[0])
                                //console.log(l10n[key].str[index])
                                //console.log('--------------------')
                            }
                        }
                    })
                }
            }

            for ( key in l10n) {
                if ( l10n[key].key.length = l10n[key].str.length) {
                    l10n[key].key.forEach( (val, index) => {
                        if (val != null && l10n[key].str[index] && val!=l10n[key].str[index]) {
                            //console.log(`${val} ===> ${l10n[key].str[index]}`)
                            let reg = new RegExp(val, 'gm')
                            let patchMatch = patch.match(reg)
                            if ( patchMatch && patchMatch.length >= 1) {
                                patch = patch.replace(reg, l10n[key].str[index])
                                //console.log(patchMatch[0])
                                //console.log(l10n[key].str[index])
                                //console.log('--------------------')
                            }
                        }
                    })
                }
            }
            console.log('===============================================')
            resolve(patch)
        })
    })
}

function copyPatchFile( filePath ) {
    return new Promise( (resolve, reject)=> {
        fs.readFile( `${patchOrignDir}/${filePath}.patch` , async (err, data) => {
            if (err) return console.log(err)
            let patch = data.toString()
            resolve(patch)
        })
    })
}

function getL10nJson ( jsonFile ) {
    return new Promise( (resolve, reject)=> {
        fs.readFile( `${l10nJsonDir}/${jsonFile}` , (err, data)=> {
            if (err) return console.log(err)
            resolve(JSON.parse(data.toString()))
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
        fs.mkdir(root + dir, err => {
            if (err && err.errno == -2) {
                createFolder(root, dir)
            }
            resolve({})
        })
    })
}

function writeFile (file, context) {
    fs.writeFile(file, context, err => {
        if(err) console.error(err)
    })
}