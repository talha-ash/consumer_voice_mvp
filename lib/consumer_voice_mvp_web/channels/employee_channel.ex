defmodule ConsumerVoiceMvpWeb.EmployeeChannel do
  use Phoenix.Channel

  def join("employee:" <> user_id, _params, socket) do
    {:ok, socket}
  end
end
