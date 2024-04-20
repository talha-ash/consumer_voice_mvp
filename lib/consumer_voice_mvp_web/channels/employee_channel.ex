defmodule ConsumerVoiceMvpWeb.EmployeeChannel do
  use Phoenix.Channel

  def join("employee:" <> user_id, _params, socket) do
    IO.inspect(user_id)
    {:ok, socket}
  end
end
