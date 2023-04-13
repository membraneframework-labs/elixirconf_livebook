defmodule JellyroomWeb.RoomChannel do
  use Phoenix.Channel

  alias Jellyfish.{Client, Room}

  @impl true
  def join("room", _message, socket) do
    # send(Jellyroom.Room, {:join, self()})
    send(self(), :join)
    {:ok, socket}
  end

  # @impl true
  # def handle_in(msg_type, msg, socket) do
  #   send(Jellyroom.Room, {:signal, msg_type, msg, self()})
  #   {:noreply, socket}
  # end

  @impl true
  def handle_info({:signal, msg_type, msg}, socket) do
    push(socket, msg_type, msg)
    {:noreply, socket}
  end

  @impl true
  def handle_info(:join, socket) do
    client = Client.new("http://localhost:5001", "notoken")
    {:ok, %Jellyfish.Room{id: room_id}} = Room.create(client)

    {:ok, %Jellyfish.Peer{id: peer_id}, token} =
      Jellyfish.Room.add_peer(client, room_id, "webrtc")

    socket = assign(socket, :client, client)
    socket = assign(socket, :room_id, room_id)
    socket = assign(socket, :peer_id, peer_id)

    push(socket, :token, token)

    {:noreply, socket}
  end
end
