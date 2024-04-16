defmodule ConsumerVoiceMvpWeb.HomeLive do
  use ConsumerVoiceMvpWeb, :live_view

  def render(assigns) do
    ~H"""
    <div></div>
    """
  end

  def mount(%{"token" => token}, _session, socket) do
    {:ok, socket}
  end

  def mount(_params, _session, socket) do
    {:ok, socket, layout: {ConsumerVoiceMvpWeb.Layouts, :auth_app}}
  end
end
