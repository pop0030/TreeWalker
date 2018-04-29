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

        const nodeKeys = Object.keys(json)
        let all = document.querySelectorAll('*')
        nodeKeys.forEach( key => {
            let strs = json[key].str
            let i = parseInt(key)
            let el = all[i]
            if (el) {
                let tagName = el.tagName
                if (tagName=='INPUT' && (
                    el.type.toLocaleLowerCase() == "button" ||
                    el.type.toLocaleLowerCase() == "submit" )) {
                        if (strs) document.querySelectorAll('*')[i].setAttribute('value', strs[0])
                } else if (tagName!=='STYLE' && tagName!=='SCRIPT' && tagName!=='OBJECT') {
                    let childNodes = el.childNodes
                    childNodes.forEach( (node, k)=> {
                        if (strs && strs[k]) document.querySelectorAll('*')[i].childNodes[k].textContent = strs[k] || '!FAILED!'
                    })
                    console.log("------------------------------------------")
                } else {}
            }
        })
        resolve({ document: document, textList: [] })
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