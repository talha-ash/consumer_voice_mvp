defmodule ConsumerVoiceMvpWeb.ClientChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.{Const, CompanyRegistry}

  @client_drop_call Const.encode(:client_drop_call)
  @client_drop_call_decoded Const.decode("client_drop_call")

  @impl true
  def join("client:" <> client_id, _params, socket) do
    client_id = String.to_integer(client_id)
    socket = assign(socket, :client_id, client_id)
    {:ok, socket}
  end

  @impl true
  def handle_in(@client_drop_call, payload, socket) do
    %{"employee_id" => employee_id, "company_id" => company_id} = payload
    client_id = socket.assigns.client_id
    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(
      server_pid,
      {@client_drop_call_decoded, {employee_id, client_id}}
    )

    {:noreply, socket}
  end
end
