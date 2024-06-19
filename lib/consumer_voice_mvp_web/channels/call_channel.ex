defmodule ConsumerVoiceMvpWeb.CallChannel do
  alias ConsumerVoiceMvp.{Sqids, CompanyRegistry, Const}
  use Phoenix.Channel

  @client_drop_call Const.encode(:client_drop_call)
  @client_drop_call_decoded Const.decode("client_drop_call")
  @client_connection_data Const.encode(:client_connection_data)
  @employee_connection_data Const.encode(:employee_connection_data)
  @br_en_client_connection_data Const.encode(:br_en_client_connection_data)
  @br_en_employee_connection_data Const.encode(:br_en_employee_connection_data)

  @impl true
  def join("call:" <> session_id, _params, socket) do
    %{employee_id: employee_id, client_id: client_id, company_id: company_id} = Sqids.decode_for_session_id!(session_id)
    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    socket =
      assign(socket, :session_id, session_id)
      |> assign(:employee_id, employee_id)
      |> assign(:client_id, client_id)
      |> assign(:company_id, company_id)
      |> assign(:server_pid, server_pid)

    {:ok, socket}
  end

  @impl true
  def handle_in(@client_drop_call, payload, socket) do
    server_pid = socket.assigns.server_pid
    %{"employee_id" => employee_id} = payload
    client_id = socket.assigns.client_id

    GenServer.cast(
      server_pid,
      {@client_drop_call_decoded, {employee_id, client_id}}
    )

    {:noreply, socket}
  end

  @imple true
  def handle_in(@client_connection_data, payload, socket) do
    broadcast(socket, @br_en_employee_connection_data, payload)
    {:noreply, socket}
  end

  @imple true
  def handle_in(@employee_connection_data, payload, socket) do
    broadcast(socket, @br_en_client_connection_data, payload)
    {:noreply, socket}
  end
end
