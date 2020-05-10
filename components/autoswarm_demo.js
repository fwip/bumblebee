const { Autoswarm } = require("../lib/autoswarm")
import { LitElement, html } from 'lit-element'

class AutoswarmDemo extends LitElement {
    static get properties() {
        return {
            name: {
                type: String,
                topic: String,
                doc: Object
            }
        }
    }

    constructor() {
        super()
        this.name = "random_" + Math.random().toString(36).substring(2, 5)
        this.topic = "autoswarm-demo"
        this.doc = null
    }

    start() {
        const swarm = new Autoswarm(this.topic)

        swarm.on('change', (docId, doc) => {
            console.log('change', doc)
            this.doc = doc
            this.requestUpdate()
        })

        setInterval(() => {
            swarm.change(doc => {
                doc[this.name] = (doc[this.name] || 0) + 1
            })
        }, 3000)
    }

    tostr() {
        return JSON.stringify(this.doc, "\t")
    }

    render() {
        return html`
        <p>Hello, ${this.name}! Welcome to the Autoswarm Demo.</p>
        ${this.doc
                ? html`<pre>${this.tostr()}</pre>`
                : html`<button @click=${this.start}>START</button>`
            }
        `
    }

}

customElements.define('autoswarm-demo', AutoswarmDemo);
