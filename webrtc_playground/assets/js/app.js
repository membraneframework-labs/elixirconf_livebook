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

import { Socket } from "phoenix"



const init = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    document.querySelector('#local-video').srcObject = localStream;

    const peerConnection = new RTCPeerConnection({
        // bundlePolicy: "max-bundle",
        // iceTransportPolicy: "relay",
        iceServers: [
            // { urls: "stun:turn.membrane.stream.org:19302" },
            // { urls: "stun:turn.membraneframework.org:19302" },
            // in case of failure 
            { urls: "stun:stun.l.google.com:19302" },
            // {
            //     urls: [
            //         "turn:turn.membraneframework.org?transport=udp",
            //         "turn:turn.membraneframework.org:3478?transport=tcp",
            //         "turns:turn.membraneframework.org:443?transport=tcp"
            //     ],
            //     username: "turn",
            //     credential: "T45B264i89p9"
            // }
        ]
    });

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    const offer = await peerConnection.createOffer()
    const socket = new Socket("/socket")
    socket.connect()
    let channel = socket.channel("room")

    channel.on("send_offer", async () => {
        console.log("send_offer")
        channel.push("sdp_offer", offer)
        peerConnection.setLocalDescription(offer)
    })

    channel.on("sdp_offer", async (sdpOffer) => {
        console.log("sdp_offer")
        await peerConnection.setRemoteDescription(sdpOffer)
        const answer = await peerConnection.createAnswer()
        channel.push("sdp_answer", answer)
        await peerConnection.setLocalDescription(answer)
    })

    channel.on("sdp_answer", async (sdpAnswer) => {
        console.log("sdp_answer")
        await peerConnection.setRemoteDescription(sdpAnswer)
    })

    channel.on("ice_candidate", async (candidate) => {
        console.log("ice_candidate")
        await peerConnection.addIceCandidate(candidate)
    })

    peerConnection.onicecandidate = (event) => {
        channel.push("ice_candidate", event.candidate)
    }

    peerConnection.ontrack = (event) => {
        console.log("ontrack")
        document.querySelector('#remote-video').srcObject = event.streams[0];
    }



    channel.join()
}

init()