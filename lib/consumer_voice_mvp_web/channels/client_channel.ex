defmodule ConsumerVoiceMvpWeb.ClientChannel do
  use Phoenix.Channel

  def join("client:" <> user_id, _params, socket) do
    {:ok, socket}
  end
end
