import 'regenerator-runtime/runtime' // required for async in parcel?
const aframe = require("aframe")
const Automerge = require('automerge')

const hyperdrive = require("hyperswarm-web")
const SDK = require("dat-sdk")

/*
async function doThings() {
    const sdk = await SDK({
        "applicationName": "bumblebee",
    })
    const { Hypercore, Hyperdrive, resolveName, getIdentity, deriveSecret, close, _swarm } = sdk

    console.log("sdk:", sdk)
    console.log("Swarm is", _swarm)

    console.log("window loc:", window.location)
    const hash = window.location.hash
    if (hash) {
        console.log("i'm the other girl:", hash)
    } else {
        const feed = Hypercore('namely', {
            valueEncoding: 'json',
            persist: false,
            // storage can be set to an instance of `random-access-*`
            // const RAI = require('random-access-idb')
            // otherwise it defaults to `random-access-web` in the browser
            // and `random-access-file` in node
            storage: null  // storage: RAI
        })
        console.log("created feed", feed)
        //const seq = await feed.append("hello from browser 1!")
        feed.on('ready', () => {
            console.log("Feed key:", feed.key.toString("hex"))
        })

    }
}

doThings()
*/

const hyperswarm = require('hyperswarm')
const crypto = require('crypto')


const swarm = hyperswarm()

// Boilerplate ?
const docSet = new Automerge.DocSet()
const initDoc = Automerge.change(Automerge.from({}), doc => doc.hello = 'Hi!')
docSet.setDoc('example', initDoc)

// Do some updates
// Make a change to the document every 3 seconds

let id = "serverNum_" + Math.random().toString(36).substring(2, 5)
setInterval(() => {
    let doc = docSet.getDoc('example')
    doc = Automerge.change(doc, doc => {
        doc[id] = (doc[id] || 0) + 1
    })
    docSet.setDoc('example', doc)
}, 3000)

// look for peers listed under this topic
const topic = crypto.createHash('sha256')
    .update('my-hyperswarm-topic-bumblebee')
    .digest()

swarm.join(topic, {
    lookup: true, // find & connect to peers
    announce: true // optional- announce self as a connection target
})

// Print out the document whenever it changes
docSet.registerHandler((docId, doc) => {
    console.log(`[${docId}] ${JSON.stringify(doc)}`)
    document.getElementById('debug').innerHTML = `<p>${JSON.stringify(doc)}</p>`
})

swarm.on('connection', (socket, details) => {
    console.log('new connection!', socket, details)

    const sendMsg = msg => (socket.send(JSON.stringify(msg)))
    const connection = new Automerge.Connection(docSet, sendMsg)


    // Receiving data from the client
    socket.on('data', (data) => {
        if (!(data instanceof Buffer)) {
            data = Buffer.from(data, 'utf8')
        }
        connection.receiveMsg(JSON.parse(data))
    })

    socket.on('close', (data) => {
        console.log(`[${socket.remoteAddress}:${socket.remotePort}] connection closed`)
        connection.close()
    })

    socket.on('error', (err) => {
        console.log(`[${socket.remoteAddress}:${socket.remotePort}] error: ${err}`)
    })

    connection.open()
    // you can now use the socket as a stream, eg:
    // process.stdin.pipe(socket).pipe(process.stdout)
})