defmodule Jellyroom.Meeting do
  use GenServer

  alias Jellyfish.{Client, Room}

  def start_link(params) do
    GenServer.start_link(__MODULE__, params)
  end

  @impl true
  def init([id]) do
    client = Client.new("http://localhost:5001", "notoken")

    {:ok, %{peers: %{}, client: client, id: id}, {:continue, nil}}
  end

  @impl true
  def handle_continue(_continue_arg, state) do
    {:ok, %Jellyfish.Room{id: room_id}} = Room.create(state.client, max_peers: 10)

    {:noreply, Map.put(state, :room_id, room_id)}
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

    if map_size(peers) == 0 do
      Room.delete(state.client, state.room_id)
      {:stop, :normal, %{state | peers: peers}}
    else
      {:noreply, %{state | peers: peers}}
    end
  end

  @spec get_meeting(room_id :: binary()) :: pid()
  def get_meeting(room_id) do
    case Registry.lookup(Jellyroom.MeetingRegistry, room_id) do
      [{meeting_pid, nil}] ->
        meeting_pid

      _not_found ->
        {:ok, meeting_pid} =
          GenServer.start(__MODULE__, [room_id],
            name: {:via, Registry, {Jellyroom.MeetingRegistry, room_id}}
          )

        meeting_pid
    end
  end
end
