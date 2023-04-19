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
import "phoenix_html";
// Establish Phoenix Socket and LiveView configuration.
import { Socket } from "phoenix";
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

const pc = new RTCPeerConnection({
  bundlePolicy: "max-bundle",
  iceServers: [{ urls: "stun:turn.membrane.video" }],
});

const mediaStream = navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    const video = document.getElementById("localStream");
    video.srcObject = stream;
    return stream;
  });

async function becomeOfferSender(channel) {
  const stream = await mediaStream;
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  pc.onicecandidate = (event) => channel.push("ice_candidate", event.candidate);
  pc.onicecandidateerror = (event) => console.log(event.candidate);

  pc.createOffer().then((offer) => {
    pc.setLocalDescription(offer);
    channel.push("sdp_offer", offer);
  });

  channel.on("sdp_answer", (answer) => {
    pc.setRemoteDescription(answer);
  });
  channel.on("ice_candidate", (candidate) => {
    pc.addIceCandidate(candidate);
  });
}

async function becomeOfferReceiver(channel, offer) {
  const stream = await mediaStream;
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  channel.on("ice_candidate", (candidate) => {
    pc.addIceCandidate(candidate);
  });

  pc.onicecandidate = (event) => channel.push("ice_candidate", event.candidate);
  pc.onicecandidateerror = (event) => console.log(event.candidate);
  pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  pc.setLocalDescription(answer);
  channel.push("sdp_answer", answer);
}

const socket = new Socket("/socket", {});
socket.connect();
let channel = socket.channel("room", {});
channel
  .join()
  .receive("ok", (resp) => {
    console.log("Joined successfully", resp);
  })
  .receive("error", (resp) => {
    console.log("Unable to join", resp);
  });

channel.on("joined", (arg) => {
  console.log("Received join, becoming sender");
  becomeOfferSender(channel);
});

channel.on("sdp_offer", (offer) => {
  console.log("Received sdp_offer, becoming receiver");
  becomeOfferReceiver(channel, offer);
});

pc.ontrack = (ev) => {
  const remoteVideo = document.getElementById("remoteStream");
  const mediaStream = remoteVideo.srcObject || new MediaStream();
  console.log(ev.streams);
  mediaStream.addTrack(ev.track);
  remoteVideo.srcObject = mediaStream;
  return false;
};

channel.push("joined", {}).receive("ok", (resp) => {
  console.log("Sent joined successfully", resp);
});
