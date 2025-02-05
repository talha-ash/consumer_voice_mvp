defmodule ConsumerVoiceMvpWeb.EmployeeCompanyChannel do
  alias ConsumerVoiceMvp.CompanyServer
  alias ConsumerVoiceMvp.{Helpers, Const, CompanyRegistry}
  alias ConsumerVoiceMvpWeb.Presence

  use Phoenix.Channel

  @employee_company_topic Const.encode(:employee_company_topic)

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_busy Const.encode(:employee_status_busy)

  @employee_accept_call Const.encode(:employee_accept_call)
  @employee_reject_call_request Const.encode(:employee_reject_call_request)

  @impl true
  def join(@employee_company_topic <> company_id, params, socket) do
    IO.inspect(company_id, label: "company_id")
    employee_id = params["employeeId"]
    company_id = Helpers.string_to_integer(company_id)
    send(self(), {:after_join, employee_id, company_id})
    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    socket =
      socket
      |> assign(:employee_id, employee_id)
      |> assign(:company_id, company_id)
      |> assign(:server_pid, server_pid)

    {:ok, socket}
  end

  @impl true
  def handle_info({:after_join, employee_id, company_id}, socket) do
    employee = ConsumerVoiceMvp.Companies.get_employee_map!(employee_id)

    {:ok, pid} = CompanyRegistry.company_pid_lookup(company_id)

    CompanyServer.on_employee_online(pid, employee)

    presenceTopic = Presence.company_employee_presence_name(company_id)

    {:ok, _} =
      Presence.track(self(), presenceTopic, employee.id, %{
        online_at: inspect(System.system_time(:second)),
        status: @employee_status_idle
      })

    {:noreply, socket}
  end

  @impl true
  def handle_info({:employee_terminate_call, employee_id}, socket) do
    presenceTopic = Presence.company_employee_presence_name(socket.assigns.company_id)

    Presence.update(self(), presenceTopic, employee_id, fn current ->
      Map.put(current, :status, @employee_status_idle)
    end)

    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_reject_call_request, payload, socket) do
    %{"client_id" => client_id} = payload

    {:ok, client_request_pid} = CompanyRegistry.call_request_pid_lookup(client_id)
    GenServer.cast(client_request_pid, {@employee_reject_call_request})

    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_accept_call, payload, socket) do
    %{"client_id" => client_id} = payload
    %{server_pid: _server_pid, employee_id: employee_id} = socket.assigns
    IO.inspect(payload, label: "Employee Accept Call")

    {:ok, client_request_pid} = CompanyRegistry.call_request_pid_lookup(client_id)
    GenServer.cast(client_request_pid, {:on_employee_call_accepting, employee_id})
    # CompanyServer.employee_accept_call(
    #   server_pid,
    #   {employee_id, client_id}
    # )

    presenceTopic = Presence.company_employee_presence_name(socket.assigns.company_id)

    Presence.update(self(), presenceTopic, employee_id, fn current ->
      Map.put(current, :status, @employee_status_busy)
    end)

    {:noreply, socket}
  end

  @impl true
  def terminate(_reason, socket) do
    employee_id = socket.assigns.employee_id
    company_id = socket.assigns.company_id
    {:ok, pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(
      pid,
      {:on_employee_offline, employee_id}
    )

    IO.inspect("Employee Goes Offline", label: "reason")
  end
end
