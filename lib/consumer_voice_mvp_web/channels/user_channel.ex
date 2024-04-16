defmodule ConsumerVoiceMvpWeb.UserChannel do
  use Phoenix.Channel

  def join("user:" <> user_id, _params, socket) do
    {:ok, socket}
  end
end
