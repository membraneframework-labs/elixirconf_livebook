defmodule WebrtcPlayground.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {WebrtcPlayground.Room, {}},
      # Start the Telemetry supervisor
      WebrtcPlaygroundWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: WebrtcPlayground.PubSub},
      # Start the Endpoint (http/https)
      WebrtcPlaygroundWeb.Endpoint
      # Start a worker by calling: WebrtcPlayground.Worker.start_link(arg)
      # {WebrtcPlayground.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: WebrtcPlayground.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    WebrtcPlaygroundWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
