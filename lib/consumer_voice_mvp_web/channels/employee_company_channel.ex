defmodule ConsumerVoiceMvpWeb.EmployeeCompanyChannel do
  alias Phoenix.PubSub
  alias ConsumerVoiceMvp.CompanyServer
  alias ConsumerVoiceMvp.{Helpers, Const, CompanyRegistry}
  alias ConsumerVoiceMvpWeb.Presence

  use Phoenix.Channel

  intercept ["presence_diff"]

  @employee_company_topic Const.encode(:employee_company_topic)

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_busy Const.encode(:employee_status_busy)
  @employee_status_offline Const.encode(:employee_status_offline)

  @employee_accept_call Const.encode(:employee_accept_call)

  @client_company_topic Const.encode(:client_company_topic)

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

    {:ok, _} =
      Presence.track(socket, employee.id, %{
        online_at: inspect(System.system_time(:second)),
        status: @employee_status_idle
      })

    # Presence.track(self(), "#{@employee_company_topic}#{company_id}", employee.id, %{})

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_info({:employee_drop_call, employee_id}, socket) do
    Presence.update(socket, employee_id, fn current ->
      Map.put(current, :status, @employee_status_idle)
    end)

    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_accept_call, payload, socket) do
    %{"client_id" => client_id} = payload
    %{server_pid: server_pid, employee_id: employee_id} = socket.assigns

    CompanyServer.employee_accept_call(
      server_pid,
      {employee_id, client_id}
    )

    Presence.update(socket, employee_id, fn current ->
      Map.put(current, :status, @employee_status_busy)
    end)

    {:noreply, socket}
  end

  @impl true
  def handle_out("presence_diff", presences, socket) do
    company_id = socket.assigns.company_id
    payload = %{joins: presences.joins}
    IO.inspect(payload, label: "Presence Diff In Handle Out")

    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@client_company_topic}#{company_id}",
      {:employee_precense_update, payload}
    )

    push(socket, "presence_diff", presences)
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

    Presence.update(socket, employee_id, fn current ->
      Map.put(current, :status, @employee_status_offline)
    end)

    presences = Presence.list(socket)

    PubSub.broadcast(
      ConsumerVoiceMvp.PubSub,
      "#{@client_company_topic}#{company_id}",
      {:employee_precense_update, %{joins: presences}}
    )

    IO.inspect("Employee Goes Offline", label: "reason")
  end
end
