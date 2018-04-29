const fs         = require('fs')
const jsdom      = require("jsdom")
const jsBeautify = require("js-beautify")
const html       = require("js-beautify").html
const { JSDOM }  = jsdom;
const Entities   = require('html-entities').AllHtmlEntities;
const ent        = new Entities();

const { devMode }     = require('./envSetting.js')
const textDeepWalker  = require('./textDeepTreeWalker.js')
const htmlFileHandler = require('./htmlFileHandler.js')
const pathDIR         = (devMode) ? require('./path_L10N_demo.js') : require('./path_L10N.js');
const ls              = (devMode) ? "data/list/demo-ls.txt" : "data/list/ls.txt"
const resDir          = (devMode) ? "resultDemo" : "result"

//textNodeParse('new')
textNodeParse('de')

function textNodeParse(LAN) {
    
    // Check folder & log file exsit
    fs.mkdir(`${resDir}/json[${LAN}]`, err => {
    if (err) console.error(err)
    fs.unlink(`${resDir}/log[${LAN}].txt`, err => {
    if (err) console.error(err)

    // Read the file list
    fs.readFile(ls, (err, data) => {
    if (err) return console.error(err)

        // init file list to array
        //const compareFiles = data.toString().split('\n');
        const compareFiles = ["root/logon.htm","reports/log_query.htm"]

        // Init directory of key (en version) & str (l10n version) 
        let keyDIR = (LAN==='new')?pathDIR['WFBS10_new']:pathDIR['WFBS95_en']
        let strDIR = (LAN==='new')?pathDIR[`WFBS10_${LAN}`]:pathDIR[`WFBS95_${LAN}`]

        // init counter
        let counter = { total: 0, success : 0, err : 0, errList : [] }

        // Run loop of each file
        compareFiles.forEach( async filePath => {

            // exclude js & css file
            if ( filePath.indexOf('.js') > 0 || filePath.indexOf('.css') > 0 ) return
            
            // Compare files of same file name
            let result = await mapHTMLFiles(keyDIR, strDIR, filePath, LAN);

            // Handle counter from compare result
            counter.success += result.success
            counter.err += result.err
            counter.total += result.total
            if(result.errfile) counter.errList.push(result.errfile) 

            // Write result to log
            let resTxt = `Language: ${LAN}\n-------------\nTotal: ${counter.total}\nSuccess: ${counter.success}\nFailed: ${counter.err}\n`
            resTxt += `-------------\n---[Fail List]---\n${counter.errList.join('\n')}\n-------------`
            consoleLog(resTxt, LAN)
        })
    })
    })
    })
}

function mapHTMLFiles (src, tar, file, LAN) {
    return new Promise( async (resolve, reject) => {
    
    // Encode file path
    const filePath  = `[${encodeURIComponent(file).replace(/%2F/g, '][')}]`

    // Parse html file
    let srcObj = await htmlFileHandler(src+file, 'en', filePath)
    let tarObj = await htmlFileHandler(tar+file, LAN , filePath)
    
    // Init counter
    let counter = {}
    counter.mapFile   = file 
    counter.total     = 0
    counter.success   = 0
    counter.err       = 0
    counter.errfile   = false
    counter.sourceNum = srcObj.eleNum 
    counter.targetNum = tarObj.eleNum 
    //console.log(`|${LAN}|===>|${file}|`)

    // Mapping result array to json solu1
    /*let result = {}
    let max = Math.max(srcObj.eleNum, tarObj.eleNum)
    for (let i=0;i<max;i++) {
        let src = srcObj.list[i]
        let tar = tarObj.list[i]
        if (src && tar) {
        if (src[i].length !=0 || tar[i].length != 0) {
            let srcF = src[i].filter( el => { return el != undefined })
            let tarF = tar[i].filter( el => { return el != undefined })
            if (srcF.length != 0 || tarF.length != 0) {
                result[i] = {}
                result[i].key = src[i]
                result[i].str = tar[i]
        }}}
    }*/
    /*let result = {}
    let max = Math.min(srcObj.eleNum, tarObj.eleNum)
    for (let i=0;i<max;i++) {
        let src = tarObj.list[i][i]
        if (src) {
        if (src.length !=0) {
            let srcF = src.filter( el => { return el != undefined })
            if (srcF.length != 0) {
                src.forEach( (str, index) => {
                    if (str) {
                        result[str] =  str
                    }
                })
        }}}
    }*/
    let result = {}
    let srcArry = []
    for (let i=0;i<srcObj.eleNum;i++) {
        let src = srcObj.list[i][i]
        if (src) {
        if (src.length !=0) {
            let srcF = src.filter( el => { return el != undefined })
            if (srcF.length != 0) {
                src.forEach( (str, index) => {
                    if (str) srcArry.push(str)
                })
        }}}
    }
    let tarArry = []
    for (let i=0;i<tarObj.eleNum;i++) {
        let tar = tarObj.list[i][i]
        if (tar) {
        if (tar.length !=0) {
            let tarF = tar.filter( el => { return el != undefined })
            if (tarF.length != 0) {
                tar.forEach( (str, index) => {
                    if (str) tarArry.push(str)
                })
        }}}
    }
    srcArry.forEach( (el,index)=> {
        result[el] = tarArry[index]
    })

    // Handle counter
    if (srcObj.eleNum == tarObj.eleNum) {
        counter.success++
    } else {
        counter.err++
        counter.errfile = file
    }
    counter.total++
    
    // init result status
    let resultStatus = (srcObj.eleNum == tarObj.eleNum)?'V':'X'
    
    // Console log if result status is X
    if (srcObj.eleNum != tarObj.eleNum) console.log(`HTML Elements unsame=>${file}`)

    // Sort result
    //result = sortResult(result)

    // Write result json
    const outputFolder = `${resDir}/json[${LAN}]`
    writeFile(`${outputFolder}/[${resultStatus}]${filePath}.json`, jsBeautify(JSON.stringify(result)))
    resolve(counter)
    })
}

function writeFile (file, context) {
    fs.writeFile(file, context, err => {
        if(err) console.error(err)
    })
}

function consoleLog (context, LAN) {
    fs.writeFile(`${resDir}/log[${LAN}].txt`, context + '\n', err => {
        if (err) return console.error(err)
    })
}

function sortResult (json) {
    let keys = Object.keys(json)
    let len = keys.length
    keys.sort()
    let result = {}
    for (let i = 0; i < len; i++) {
        let k = keys[i]
        result[k] = json[k]
    }
    return result
}