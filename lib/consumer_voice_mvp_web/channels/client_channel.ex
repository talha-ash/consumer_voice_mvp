defmodule ConsumerVoiceMvpWeb.ClientChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.{Const, CompanyRegistry}

  @client_connection_data Const.encode(:client_connection_data)
  @client_connection_data_decoded Const.decode("client_connection_data")

  @impl true
  def join("client:" <> client_id, _params, socket) do
    client_id = String.to_integer(client_id)
    socket = assign(socket, :client_id, client_id)
    {:ok, socket}
  end

  @impl true
  def handle_in(@client_connection_data, payload, socket) do
    %{
      "connection_data" => connection_data,
      "employee_id" => employee_id,
      "company_id" => company_id
    } = payload

    client_id = socket.assigns.client_id
    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(
      server_pid,
      {@client_connection_data_decoded, {connection_data, client_id, employee_id}}
    )

    {:noreply, socket}
  end
end
