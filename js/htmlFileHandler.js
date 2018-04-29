const fs  = require('fs')
const jsdom = require("jsdom")
const html = require("js-beautify").html
const { JSDOM } = jsdom
const Entities = require('html-entities').AllHtmlEntities
const ent = new Entities()

const textDeepWalker = require('./textDeepTreeWalker.js')
const textTreeReplace = require('./textTreeReplace.js')

function htmlFileHandle (htmlFile, LAN, filePathEncode) {
    return new Promise( (resolve, reject) => {
        fs.readFile(`${htmlFile}`, async (err, data) => {
            if (err) return console.error(err)
            data = data.toString()
            let domRead = new JSDOM(data,{contentType: "text/html",includeNodeLocations: true})
            let domWrit = new JSDOM(data,{contentType: "text/html",includeNodeLocations: true})
            let documentRead = domRead.window.document
            let documentWrit = domWrit.window.document
            let all = documentRead.querySelectorAll('*')
            let TreeRead = await textDeepWalker (documentRead, LAN, filePathEncode)
            let TreeWrit = await textTreeReplace(documentWrit, LAN, filePathEncode)
            resolve({ 
                c : TreeRead.textList.length, 
                list: TreeRead.textList,
                //doc: ent.decode(dom.serialize()),
                doc:    '<!doctype html>\n<html>\n<head>\n'+documentWrit.head.innerHTML+'</head>\n<body>'+documentWrit.body.innerHTML+'</body></html>',
                docEXT: '<!doctype html>\n<html>\n<head>\n'+documentRead.head.innerHTML+'</head>\n<body>'+documentRead.body.innerHTML+'</body></html>',
                eleNum: all.length
            })
        })
    })
}

function readHTMLFile (htmlFile) {
    return new Promise( (resolve, reject) => {
        fs.readFile(`../${htmlFile}`, (err, data) => {
            if (err) return console.error(err)
            data = data.toString().replace(/\r\n|\n/g," ").replace(/\s+/g, " ").replace(/\t+/g, " ")
            let dom = new JSDOM(data)
            let document = dom.window.document
            //let all = body.querySelectorAll('*')
            
            let counter = 0
            let output = textNodesUnder(document.body);
            resolve({ c : output.length, res: output })
        })
    })
}

module.exports = htmlFileHandle