defmodule JellyroomWeb.RoomChannel do
  use Phoenix.Channel

  alias Phoenix.Socket
  alias Jellyfish.{Client, Room}

  @impl true
  def join("room", _message, socket) do
    send(self(), :join)
    {:ok, socket}
  end

  @impl true
  def handle_info(:join, socket) do
    client = Client.new("http://localhost:5001", "notoken")
    {:ok, %Jellyfish.Room{id: room_id}} = Room.create(client, max_peers: 10)

    {:ok, %Jellyfish.Peer{id: peer_id}, token} = Room.add_peer(client, room_id, "webrtc")

    socket = Socket.assign(socket, :client, client)
    socket = Socket.assign(socket, :room_id, room_id)
    socket = Socket.assign(socket, :peer_id, peer_id)

    push(socket, "token", %{token: token})

    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    Room.delete_peer(socket.assigns.client, socket.assigns.room_id, socket.assigns.peer_id)
    Room.delete(socket.assigns.client, socket.assigns.room_id)
  end
end
