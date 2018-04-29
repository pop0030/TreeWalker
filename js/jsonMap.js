const fs  = require('fs')
const jsBeautify = require("js-beautify")

mapLangJson('tw', 'new') 

function mapLangJson(LAN1, LAN2) {
    fs.mkdir(`json[${LAN1}-${LAN2}]`, err => {
    if (err) console.error(err)
    fs.readFile('ls.txt', (err, data) => {
    if (err) return console.error(err)

        const compareFiles = data.toString().split('\n');
        compareFiles.forEach( async filePath => {
            if ( filePath.indexOf('.js') > 0 || filePath.indexOf('.css') > 0 ) return

            let jsonFileName = `[V][${encodeURIComponent(filePath).replace(/%2F/g, '][')}].json`
            let lan1json = await readJson(LAN1, jsonFileName)
            let lan2json = await readJson(LAN2, jsonFileName)

            for (key in lan2json) {
            let strArr = lan2json[key].str
            for (let i=0;i<strArr.length;i++) {
                if (strArr[i]!=null) {
                    let result = findIn(lan1json, strArr[i])
                    if (result) console.log(result)
                    if (result) lan2json[key].str[i] = result
                }
            }}

            writeFile(`json[${LAN1}-${LAN2}]/${jsonFileName}`, jsBeautify(JSON.stringify(lan2json)))
        })

    })
    })
}

function readJson(LAN, jsonFileName) {
    return new Promise( (resolve, reject) => {
    fs.readFile(`json[${LAN}]/${jsonFileName}`, (err, data) => {
        if (err) return resolve({ err: 'error file' })
        let json = JSON.parse(data.toString())
        resolve(json)
    })})
}

function findIn (json, target) {
    let result
    for (key in json){
        if (json[key]==undefined) console.log(json)
        let strArr = json[key].str
        let keyArr = json[key].key
        for (let n=0; n<keyArr.length; n++) {
            if (keyArr[n]==target) {
                result = strArr[n]
            }
        }
    }
    return result
}

function writeFile (file, context) {
    fs.writeFile(file, context, err => {
        if(err) console.error(err)
    })
}