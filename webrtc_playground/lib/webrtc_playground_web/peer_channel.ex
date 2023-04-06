defmodule WebrtcPlaygroundWeb.PeerChannel do
  use Phoenix.Channel

  @impl true
  def join("room", _message, socket) do
    send(WebrtcPlayground.Room, {:join, self()})
    {:ok, socket}
  end

  @impl true
  def handle_in(msg_type, msg, socket) do
    send(WebrtcPlayground.Room, {:signal, msg_type, msg, self()})
    {:noreply, socket}
  end

  @impl true
  def handle_info({:signal, msg_type, msg}, socket) do
    push(socket, msg_type, msg)
    {:noreply, socket}
  end
end
