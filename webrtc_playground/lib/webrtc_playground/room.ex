defmodule WebrtcPlayground.Room do
  use GenServer

  def start_link(_params) do
    GenServer.start_link(__MODULE__, [])
  end

  @impl true
  def init(_params) do
    Process.register(self(), __MODULE__)

    {:ok, %{peers: []}}
  end

  @impl true
  def handle_info({:join, peer}, state) do
    if state.peers != [] do
      [old_peer | _] = state.peers
      send(old_peer, {:signal, "send_offer", %{}})
    end

    {:noreply, %{peers: [peer | state.peers]}}
  end

  @impl true
  def handle_info({:signal, msg_type, msg, from}, state) do
    peer = Enum.find(state.peers, &(&1 != from))
    send(peer, {:signal, msg_type, msg})
    {:noreply, state}
  end
end
