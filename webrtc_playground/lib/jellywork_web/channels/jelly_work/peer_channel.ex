defmodule JellyWorkWeb.JellyWork.PeerChannel do
  use JellyWorkWeb, :channel

  @impl true
  def join("room", _payload, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_in(msg, args, socket) do
    broadcast_from(socket, msg, args)
    {:reply, :ok, socket}
  end
end
