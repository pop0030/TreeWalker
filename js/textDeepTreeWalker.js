const fs  = require('fs')

const { devMode } = require('./envSetting.js')
const resDir      = (devMode) ? "resultDemo" : "result"

function textDeepWalker(document, LAN, filePathEncode) {
    return new Promise( (resolve, reject) => {
        console.log(LAN + filePathEncode)
        if (!document) return
        let textList = []
        fs.readFile(`${resDir}/json[${LAN}]/[V]${filePathEncode}.json`, (err, data) => {
        let json = {}
        if (err) {
            //console.error(err)
        } else {
            json = JSON.parse(data.toString())
        }
        document.querySelectorAll('*').forEach( (el,i) => {
            if (el) {
                let tagName = el.tagName
                let nodeList = {}
                nodeList[i] = []

                if(tagName=='INPUT' && (
                    el.type.toLocaleLowerCase()=="button" ||
                    el.type.toLocaleLowerCase()=="submit" )) {
                    let val = document.querySelectorAll('*')[i].value.trim()
                    if(val !== "") {
                        nodeList[i] = [val]
                        textList.push(nodeList)
                        document.querySelectorAll('*')[i].setAttribute("value",`___@TOKENID@___`)
                    }else{
                        nodeList[i] = [""]
                        textList.push(nodeList)
                    }
                } else if (tagName!=='STYLE' && tagName!=='SCRIPT' && tagName!=='OBJECT') {
                    let childNodes = el.childNodes
                    childNodes.forEach( (node, k)=> {
                        let nodeValue, str, key
                        if (node.nodeType == 3 && node.nodeValue) {
                            nodeValue = node.textContent.replace(/\r\n|\n/g," ").replace(/\s+/g, " ").replace(/\t+/g, " ").trim()
                        } else if (node.nodeType == 8 && node.nodeValue) {
                            //nodeValue = `<COMMIT:${node.textContent.replace(/\r\n|\n/g," ").replace(/\s+/g, " ").replace(/\t+/g, " ").trim()}>`
                            nodeValue = null
                        } else {
                            nodeValue = ""
                        }
                        if (nodeValue !=="") {
                            str = node.textContent, key = nodeValue
                            document.querySelectorAll('*')[i].childNodes[k].textContent = `___@TOKENID@___`
                        }
                        nodeList[i].push(key)
                    })
                    textList.push(nodeList)
                } else {
                    //nodeList[i] = [`<tag:${el.tagName}>`]
                    nodeList[i] = [null]
                    textList.push(nodeList)
                }
                if (tagName=="META" && el.httpEquiv.toLocaleUpperCase()=="CONTENT-TYPE") {
                    document.querySelectorAll('*')[i].setAttribute('content',"text/html; charset=UTF-8")
                }
            }
        })
        resolve({ document: document, textList: textList })
    })
    })
}

module.exports = textDeepWalker

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
                    tagName == "title"  ||
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