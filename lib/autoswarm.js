const Automerge = require('automerge')

//const hyperdrive = require("hyperswarm-web")
//const SDK = require("dat-sdk")
const hyperswarm = require('hyperswarm')
const crypto = require('crypto')


class Autoswarm {

    constructor(topicName, options) {
        /*
        const { docName, init, swarmOpts } = {
            docName: 'default',
            init: {},
            swarmOpts: {},
            ...options
        }
        */
        let init = {}
        let swarmOpts = {}

        // State
        this.docName = 'default'
        this.swarm = hyperswarm(swarmOpts)
        this.docSet = new Automerge.DocSet()
        this._on = {}

        const initDoc = Automerge.from(init)
        this.docSet.setDoc(this.docName, initDoc)

        // Set up listeners
        this.docSet.registerHandler((docId, doc) => {
            this._ifOn('change', docId, doc)
        })

        // look for peers listed under this topic
        const topic = crypto.createHash('sha256')
            .update(topicName)
            .digest()

        this.swarm.join(topic, {
            lookup: true, // find & connect to peers
            announce: true // optional- announce self as a connection target
        })

        this.swarm.on('connection', (socket, details) => {
            const sendMsg = msg => (socket.send(JSON.stringify(msg)))
            const connection = new Automerge.Connection(this.docSet, sendMsg)

            // Receiving data from the client
            socket.on('data', (data) => {
                if (!(data instanceof Buffer)) {
                    data = Buffer.from(data, 'utf8')
                }
                connection.receiveMsg(JSON.parse(data))
                this._ifOn('data', data)
            })

            socket.on('close', (data) => {
                connection.close()
                this._ifOn('close', data)
            })

            socket.on('error', (err) => {
                this._ifOn('error', err)
            })

            connection.open()
            this._ifOn('connection', socket, details)
        })
    }

    _ifOn(eventName, ...args) {
        if (this._on[eventName]) {
            this._on[eventName](...args)
        }
    }

    on(eventName, callback) {
        this._on[eventName] = callback
    }

    get() {
        return this.docSet.getDoc(this.docName)
    }

    change(changeFn) {
        let doc = this.docSet.getDoc(this.docName)
        doc = Automerge.change(doc, changeFn)
        this.docSet.setDoc(this.docName, doc)
    }

    save() {
        return Automerge.save(this.get())
    }

    load(data) {
        docSet.setDoc(this.docName, Automerge.load(data))
    }
}


module.exports = {
    Autoswarm
}