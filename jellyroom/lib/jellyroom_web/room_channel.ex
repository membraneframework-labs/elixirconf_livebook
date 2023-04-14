defmodule JellyroomWeb.RoomChannel do
  use Phoenix.Channel

  alias Jellyfish.Room
  alias Jellyroom.Meeting

  @impl true
  def join("room:" <> room_id, _message, socket) do
    send(self(), {:join, room_id})
    {:ok, socket}
  end

  def handle_info({:peer_joined, _peer}, socket) do
    {:noreply, socket}
  end

  def handle_info({:peer_left, _peer}, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_info({:join, room_id}, socket) do
    meeting_pid = Meeting.get_meeting(room_id)

    token = GenServer.call(meeting_pid, :join)

    push(socket, "token", %{token: token})

    {:noreply, socket}
  end

  # @impl true
  # def terminate(_reason, socket) do
  #   Room.delete_peer(socket.assigns.client, socket.assigns.room_id, socket.assigns.peer_id)
  #   Room.delete(socket.assigns.client, socket.assigns.room_id)
  # end
end
