defmodule Jellyroom.Room do
  use GenServer

  alias Jellyfish.{Client, Room}

  def start_link(_params) do
    GenServer.start_link(__MODULE__, [])
  end

  @impl true
  def init(_params) do
    client = Client.new("http://localhost:5001", "notoken")
    {:ok, %Jellyfish.Room{id: room_id}} = Room.create(client, max_peers: 10)

    Process.register(self(), __MODULE__)
    {:ok, %{peers: %{}, client: client, room_id: room_id}}
  end

  @impl true
  def handle_call(:join, {peer_pid, _}, state) do
    {:ok, %Jellyfish.Peer{id: peer_id}, token} =
      Room.add_peer(state.client, state.room_id, "webrtc")

    Process.monitor(peer_pid)

    {:reply, token, %{state | peers: Map.put(state.peers, peer_pid, peer_id)}}
  end

  @impl true
  def handle_info({:DOWN, _ref, :process, peer_pid, _reason}, state) do
    peer_id = Map.get(state.peers, peer_pid)
    peers = Map.delete(state.peers, peer_pid)

    :ok = Room.delete_peer(state.client, state.room_id, peer_id)

    {:noreply, %{state | peers: peers}}
  end
end
