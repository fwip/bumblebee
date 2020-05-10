import 'regenerator-runtime/runtime' // required for async in parcel?
const aframe = require("aframe")

const { Autoswarm } = require("../lib/autoswarm")

function startDemo() {
    const swarm = new Autoswarm("bumblebee-hello-world")

    swarm.on('change', (docId, doc) => {
        console.log("got change!")
        console.log(`[${docId}] ${JSON.stringify(doc)}`)
        console.log(`[${docId}] -> ${swarm.save()}`)
        let state = { you: id, shared: doc }
        document.getElementById('debug').innerHTML = `<p><pre>${JSON.stringify(state, null, '\t')}</pre></p>`
    })

    let id = "random_" + Math.random().toString(36).substring(2, 5)
    setInterval(() => {
        swarm.change(doc => {
            doc[id] = (doc[id] || 0) + 1
        })
    }, 3000)
}