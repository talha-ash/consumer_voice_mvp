defmodule ConsumerVoiceMvpWeb.CallChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.Calls
  alias ConsumerVoiceMvp.CallSessionServer
  alias ConsumerVoiceMvp.CallSessionRegistry
  alias Phoenix.PubSub
  alias ConsumerVoiceMvp.{Sqids, CompanyRegistry, Const}

  @client_terminate_call Const.encode(:client_terminate_call)
  @client_terminate_call_decoded Const.decode("client_terminate_call")
  @client_connection_data Const.encode(:client_connection_data)
  @client_init_complete Const.encode(:client_init_complete)

  @employee_terminate_call Const.encode(:employee_terminate_call)
  @employee_terminate_call_decoded Const.decode("employee_terminate_call")
  @employee_company_topic Const.encode(:employee_company_topic)
  @employee_connection_data Const.encode(:employee_connection_data)
  @employee_init_complete Const.encode(:employee_init_complete)

  @br_en_client_call_terminate Const.encode(:br_en_client_call_terminate)
  @br_en_employee_call_terminate Const.encode(:br_en_employee_call_terminate)
  @br_en_client_connection_data Const.encode(:br_en_client_connection_data)
  @br_en_employee_connection_data Const.encode(:br_en_employee_connection_data)

  @impl true
  def join("call:" <> session_id, %{"join_by" => join_by}, socket) do
    %{employee_id: employee_id, client_id: client_id, company_id: company_id} = Sqids.decode_for_session_id!(session_id)

    case Calls.get_non_ended_call({:session, session_id, company_id}) do
      {:not_found, message} ->
        {:error, %{reason: message, error_type: :not_found}}

      {:ok, _} ->
        {:ok, company_server_pid} = CompanyRegistry.company_pid_lookup(company_id)
        {:ok, server_pid} = CallSessionRegistry.call_session_pid_lookup(session_id)

        CallSessionServer.track_channel(server_pid, join_by, socket)

        socket =
          assign(socket, :session_id, session_id)
          |> assign(:employee_id, employee_id)
          |> assign(:client_id, client_id)
          |> assign(:company_id, company_id)
          |> assign(:company_server_pid, company_server_pid)
          |> assign(:server_pid, server_pid)

        {:ok, socket}
    end
  end

  @impl true
  def handle_in(@client_terminate_call, _payload, socket) do
    %{
      company_server_pid: company_server_pid,
      client_id: client_id,
      company_id: company_id,
      employee_id: employee_id,
      server_pid: server_pid
    } =
      socket.assigns

    GenServer.cast(
      company_server_pid,
      {@client_terminate_call_decoded, {client_id}}
    )

    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@employee_company_topic}#{company_id}",
      {:employee_terminate_call, employee_id}
    )

    broadcast(socket, @br_en_client_call_terminate, %{})
    GenServer.stop(server_pid)
    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_terminate_call, _payload, socket) do
    %{company_server_pid: company_server_pid, server_pid: server_pid, employee_id: employee_id, company_id: company_id} =
      socket.assigns

    GenServer.cast(
      company_server_pid,
      {@employee_terminate_call_decoded, {employee_id}}
    )

    # by broadcasting tell the employee company channel to update the employee status
    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@employee_company_topic}#{company_id}",
      {:employee_terminate_call, employee_id}
    )

    broadcast(socket, @br_en_employee_call_terminate, %{})
    GenServer.stop(server_pid)
    {:noreply, socket}
  end

  @impl true
  def handle_in(@client_connection_data, payload, socket) do
    CallSessionServer.connection_data(socket.assigns.server_pid, {:client, payload["connection_data"]})
    broadcast(socket, @br_en_client_connection_data, payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_connection_data, payload, socket) do
    CallSessionServer.connection_data(socket.assigns.server_pid, {:employee, payload["connection_data"]})
    broadcast(socket, @br_en_employee_connection_data, payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in(@client_init_complete, _payload, socket) do
    CallSessionServer.client_init_complete(socket.assigns.server_pid)
    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_init_complete, _payload, socket) do
    CallSessionServer.employee_init_complete(socket.assigns.server_pid)
    {:noreply, socket}
  end

  @impl true
  def terminate(reason, arg1) do
    IO.inspect(reason, label: "why channel left reason")
    IO.inspect(arg1, label: "arg1")
    :ok
  end
end
