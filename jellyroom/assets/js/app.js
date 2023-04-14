// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
// import {Socket} from "phoenix"
// import {LiveSocket} from "phoenix_live_view"
// import topbar from "../vendor/topbar"

// let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
// let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
// topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
// window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
// window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
// liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
// window.liveSocket = liveSocket

import { createClient } from "./connection.ts"
import { Socket } from "phoenix"

const initMeeting = async (room_id) => {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    document.querySelector('#local-video').srcObject = localStream;


    const socket = new Socket("/socket")
    socket.connect()
    let channel = socket.channel(`room:${room_id}`)
    let client

    channel.on("token", (token) => {
        console.log("Received", token)
        client = createClient(token, localStream)
    })

    channel.join()
        .receive("ok", resp => { console.log("Joined successfully", resp) })
        .receive("error", resp => { console.log("Unable to join", resp) })

}

const init = async () => {
    const btn = document.querySelector('#button')
    const text = document.querySelector('#name')
    btn.onclick = () => {
        window.location = `room/${text.value}`
    }

}

const full_url = document.URL; // Get current url
const url_array = full_url.split('/') // Split the string into an array with / as separator
const last_segment = url_array[url_array.length - 1];


if (url_array.length > 2 && url_array[url_array.length - 2] == "room") initMeeting(last_segment)
else init()

