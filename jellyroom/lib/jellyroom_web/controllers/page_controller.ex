defmodule JellyroomWeb.PageController do
  use JellyroomWeb, :controller

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end

  def meeting(conn, _params) do
    render(conn, :meeting, layout: false)
  end
end
