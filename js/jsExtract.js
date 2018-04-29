const fs  = require('fs')
const jsdom = require("jsdom")
const html = require("js-beautify").html
const { JSDOM } = jsdom;
const Entities = require('html-entities').AllHtmlEntities;
const ent = new Entities();

const resDir = 'extract'
const ls = "data/list/ls.txt"
const htmlFileHandler = require('./htmlFileHandler.js')
const pathDIR = require('./path_L10N.js')

extractLAN('en')
extractLAN('tw')
extractLAN('new')

function extractLAN(LAN) {
    fs.mkdir(`${resDir}/html[${LAN}]`, err => {
    if (err) console.error(err)
    fs.readFile(ls, (err, data) => {
    if (err) return console.error(err)
        const VER = (LAN=="new")?"10":"95"
        //const compareFiles = data.toString().split('\n');
        const compareFiles = ["reports/log_query.htm"]
        let counter = { total: 0, success : 0, err : 0, errList : [] }
        compareFiles.forEach( async filePath => {
            if ( filePath.indexOf('.js') > 0 || filePath.indexOf('.css') > 0 ) return

            let result = await htmlFileHandler(pathDIR[`WFBS${VER}_${LAN}`] + filePath, LAN, filePath)
            filePath  = `[${encodeURIComponent(filePath).replace(/%2F/g, '][')}]`
            writeFile(`${resDir}/html[${LAN}]/${filePath}.htm`, result.docEXT)
            
        })
    })
    })
}

function replaceHTMLFile (htmlFile) {
    return new Promise( (resolve, reject) => {
        fs.readFile(`../${htmlFile}`, (err, data) => {
            if (err) return console.error(err)
            console.log(htmlFile)
            data = data.toString().replace(/\r\n|\n/g,"").replace(/\s+/g, " ").replace(/\t+/g, " ")
            let dom = new JSDOM(data)
            let document = dom.window.document
            let all = document.querySelectorAll('*')
            let TDW = textDeepWalker(document)
            document = TDW.document
            resolve({ 
                c : TDW.textList.length, 
                list: TDW.textList,
                doc: '<!DOCTYPE html>\n<html>\n'+html(document.head.outerHTML) + '\n' + html(document.body.outerHTML) + '\n</html>'})
        })
    })
}

function writeFile (file, context) {
    fs.writeFile(file, context, err => {
        if(err) console.error(err)
    })
}

function consoleLog (context, LAN) {
    fs.writeFile(`log[${LAN}].txt`, context + '\n', err => {
        if (err) return console.error(err)
    })
}

function textNodesUnder(node){
    let all = [];
    if (node && node.firstChild) {
    for (node = node.firstChild; node; node = node.nextSibling ) {
        if (node.nodeType == 3) {
            let str = node.textContent.replace(/\r\n|\n/g,"").replace(/\s+/g, " ").replace(/\t+/g, " ")
            if (str.length > 0 && str != " ") all.push(str)
        } else {
            if (node.nodeType == 1) {
                let tagName = node.tagName.toLocaleLowerCase()
                if (tagName == "style"  ||
                    tagName == "script" ||
                    tagName == "object" ) return all

                if (tagName == "input" && (
                    node.type.toLocaleLowerCase() == "button" ||
                    node.type.toLocaleLowerCase() == "submit" )) {
                        let str = node.value.replace(/\r\n|\n/g,"").replace(/\s+/g, " ").replace(/\t+/g, " ")
                        if (str.length > 0 && str != " ") all.push(str);
                    }
            }
            all = all.concat(textNodesUnder(node))
        } 
    }}
    return all
}

function textDeepWalker(document) {
    if (!document) return
    let textList = []
    document.querySelectorAll('*').forEach( (el,i) => {
        if (el) {
            let tagName = el.tagName
            if (tagName!=='STYLE' && tagName!=='SCRIPT' && tagName!=='OBJECT') {
                let childNodes = el.childNodes
                childNodes.forEach( (node, k)=> {
                    if (node.nodeType == 3 && node.nodeValue) {
                    let nodeValue = node.nodeValue.replace(/\r\n|\n/g,"").replace(/\s+/g, " ").replace(/\t+/g, " ")
                    if (nodeValue !=="" && nodeValue !==" ") {
                        textList.push(document.querySelectorAll('*')[i].childNodes[k].textContent)
                        document.querySelectorAll('*')[i].childNodes[k].textContent = "@!L10N!TEXT!NODE!@"
                    }
                    }
                })
            }

            if (tagName=='INPUT' && (
                el.type.toLocaleLowerCase() == "button" ||
                el.type.toLocaleLowerCase() == "submit" )) {
                textList.push(document.querySelectorAll('*')[i].value)
                document.querySelectorAll('*')[i].setAttribute('value',"@!L10N!TEXT!NODE!@")
            }

            if (tagName=="META" && el.httpEquiv.toLocaleUpperCase()=="CONTENT-TYPE") {
                document.querySelectorAll('*')[i].setAttribute('content',"text/html; charset=UTF-8")
            }
        }
    })
    return { document: document, textList: textList }
}