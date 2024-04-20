defmodule ConsumerVoiceMvpWeb.ClientChannel do
  use Phoenix.Channel

  def join("client:" <> user_id, _params, socket) do
    IO.inspect(user_id)
    {:ok, socket}
  end
end
