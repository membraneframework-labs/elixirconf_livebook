// import { JellyfishClient } from "@jellyfish-dev/jellyfish-react-client/jellyfish";
import { JellyfishClient } from "@jellyfish-dev/ts-client-sdk";
import { Peer, TrackContext } from "@jellyfish-dev/membrane-webrtc-js"


export const createClient = (peerToken, localStream: MediaStream): JellyfishClient<{}, {}> => {
    const client = new JellyfishClient(); // if url is not provided, it will default to ws://localhost:4000/socket/websocket

    const config = {
        peerMetadata: { name: "peer" },
        isSimulcastOn: false,
        token: peerToken.token,
        websocketUrl: "ws://localhost:5001/socket/websocket"
    }


    // You can listen to events emitted by the client
    client.on("onJoinSuccess", (peerId, peersInRoom) => {
        console.log("join success");

        const { webrtc } = client

        localStream.getTracks().forEach(track => {
            const trackId = webrtc!!.addTrack(track, localStream)
        })

    });

    client.on("onTrackReady", (ctx: TrackContext) => {
        const remotePeers = document.getElementById("remote-peers");
        const template = document.getElementById("remote-video")!!;

        let peerVideo: HTMLVideoElement | null = document.getElementById(`peer${ctx.peer.id}`) as (HTMLVideoElement | null)

        if (peerVideo == null) {
            const clone = template.cloneNode(true)!! as HTMLVideoElement;
            clone.id = `peer${ctx.peer.id}`
            remotePeers!!.appendChild(clone);
            peerVideo = clone
        }

        peerVideo.srcObject = ctx.stream
        peerVideo.play()
    })

    client.on("onPeerLeft", (peer) => {
        const element = document.getElementById(`peer${peer.id}`)
        element?.remove()
    })

    // Start the peer connection
    client.connect(config);


    return client
}