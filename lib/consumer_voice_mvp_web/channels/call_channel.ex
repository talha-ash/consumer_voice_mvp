defmodule ConsumerVoiceMvpWeb.CallChannel do
  alias Phoenix.PubSub
  alias ConsumerVoiceMvp.{Sqids, CompanyRegistry, Const}
  use Phoenix.Channel

  @client_drop_call Const.encode(:client_drop_call)
  @client_drop_call_decoded Const.decode("client_drop_call")
  @employee_drop_call Const.encode(:employee_drop_call)
  @employee_drop_call_decoded Const.decode("employee_drop_call")
  @client_connection_data Const.encode(:client_connection_data)
  @employee_connection_data Const.encode(:employee_connection_data)
  @br_en_client_connection_data Const.encode(:br_en_client_connection_data)
  @br_en_employee_connection_data Const.encode(:br_en_employee_connection_data)
  @br_en_client_call_drop Const.encode(:br_en_client_call_drop)
  @br_en_employee_call_drop Const.encode(:br_en_employee_call_drop)
  @employee_company_topic Const.encode(:employee_company_topic)

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
  def handle_in(@client_drop_call, _payload, socket) do
    %{server_pid: server_pid, client_id: client_id, company_id: company_id, employee_id: employee_id} = socket.assigns

    GenServer.cast(
      server_pid,
      {@client_drop_call_decoded, {client_id}}
    )

    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@employee_company_topic}#{company_id}",
      {:employee_drop_call, employee_id}
    )

    broadcast(socket, @br_en_client_call_drop, %{})
    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_drop_call, _payload, socket) do
    %{server_pid: server_pid, employee_id: employee_id, company_id: company_id} = socket.assigns

    GenServer.cast(
      server_pid,
      {@employee_drop_call_decoded, {employee_id}}
    )

    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@employee_company_topic}#{company_id}",
      {:employee_drop_call, employee_id}
    )

    broadcast(socket, @br_en_employee_call_drop, %{})
    {:noreply, socket}
  end

  @imple true
  def handle_in(@client_connection_data, payload, socket) do
    broadcast(socket, @br_en_client_connection_data, payload)
    {:noreply, socket}
  end

  def handle_in(@employee_connection_data, payload, socket) do
    broadcast(socket, @br_en_employee_connection_data, payload)
    {:noreply, socket}
  end
end
