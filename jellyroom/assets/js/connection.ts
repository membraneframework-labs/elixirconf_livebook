import { JellyfishClient } from "@jellyfish-dev/jellyfish-react-client/jellyfish";
import { SCREEN_SHARING_MEDIA_CONSTRAINTS } from "@jellyfish-dev/jellyfish-react-client/navigator";


export const createClient = (peerToken) => {
    console.log(peerToken)

    const client = new JellyfishClient(); // if url is not provided, it will default to ws://localhost:4000/socket/websocket

    // Start the peer connection
    client.connect({
        peerMetadata: { name: "peer" },
        isSimulcastOn: false,
        token: peerToken,
        websocketUrl: "ws://localhost:5001/socket/websocket"
    });

    // You can listen to events emitted by the client
    client.on("onJoinSuccess", (peerId, peersInRoom) => {
        console.log("join success");
    });

    async function startScreenSharing() {
        const { webrtc } = client;
        // Check if webrtc is initialized
        if (!webrtc) return console.error("webrtc is not initialized");

        // Create a new MediaStream to add tracks to
        const localStream: MediaStream = new MediaStream();

        // Get screen sharing MediaStream
        const screenStream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARING_MEDIA_CONSTRAINTS);

        // Add tracks from screen sharing MediaStream to local MediaStream
        screenStream.getTracks().forEach((track) => localStream.addTrack(track));

        // Add local MediaStream to webrtc
        localStream.getTracks().forEach((track) => webrtc.addTrack(track, localStream, { type: "screen" }));
    }

    return client
}