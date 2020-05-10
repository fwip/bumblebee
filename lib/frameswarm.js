let AFRAME = window.AFRAME;
let { Autoswarm } = require("./autoswarm.js")

AFRAME.registerSystem('frameswarm', {
    schema: {
        topic: { default: 'frameswarm' },
        user: { default: 'a ghost' },
        frequency: { default: 5000 },
    },

    init: function () {
        console.log("hello")
        this.entities = [];
        this.topic = "frameswarm"
        this.swarm = new Autoswarm(this.topic)

        this.olddoc = {}

        const self = this

        applyChangesFromSwarm = (doc) => {
            self.olddoc = doc

            console.log('change', Date.now(), doc)
            Object.keys(doc).forEach(id => {
                const el = document.getElementById(id)
                Object.keys(doc[id]).forEach((componentName) => {
                    const newval = doc[id][componentName]
                    if (JSON.stringify(el.getAttribute(componentName)) != JSON.stringify(newval)) {
                        console.log(`setting ${componentName} to ${JSON.stringify(doc[id][componentName])} on ${id}`)
                        el.setAttribute(componentName, doc[id][componentName])
                    }
                })
            })
        }

        applyLocalChanges = () => {
            // Gather changes that happened since last time
            console.log("looking for changes...")
            let changes = []
            self.entities.forEach(el => {
                const id = el.getAttribute('id')
                el.getAttribute('frameswarm').components.forEach(componentName => {
                    const newVal = el.getAttribute(componentName)
                    const oldVal = self?.olddoc?.[id]?.[componentName]
                    if (JSON.stringify(newVal) != JSON.stringify(oldVal)) {
                        console.log(`Setting ${componentName} to ${JSON.stringify(newVal)} on ${id}`)
                        console.log(newVal)
                        changes.push({ e: id, c: componentName, v: newVal })
                    }
                })
            })

            if (changes.length === 0) {
                return
            }
            // Update the document with changes
            // TODO: Handle deletions?
            self.swarm.change(doc => {
                changes.forEach(c => {
                    console.log("changing...", c)
                    if (!doc.hasOwnProperty(c.e)) {
                        doc[c.e] = {}
                    }
                    doc[c.e][c.c] = c.v
                })
            })
        }

        this.swarm.on('change', (_, doc) => {
            applyChangesFromSwarm(doc)
        })

        setInterval(
            //setTimeout(
            () => { applyLocalChanges() },
            3000,
        )
    },
    // Code to let the components register themselves
    registerMe: function (el) {
        this.entities.push(el);
    },
    unregisterMe: function (el) {
        var index = this.entities.indexOf(el);
        this.entities.splice(index, 1);
    }
});

AFRAME.registerComponent('frameswarm', {
    schema: {
        id: { default: '' },
        components: { default: ['position', 'rotation'] },
    },

    init: function () {
        this.system.registerMe(this.el);
    },

    remove: function () {
        this.system.unregisterMe(this.el);
    }
});