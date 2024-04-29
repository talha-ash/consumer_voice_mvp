defmodule ConsumerVoiceMvpWeb.EmployeeChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.{Helpers, Const, CompanyRegistry}

  @employee_accept_call Const.encode(:employee_accept_call)
  @employee_accept_call_decoded Const.decode("employee_accept_call")
  @employee_drop_call Const.encode(:employee_drop_call)
  @employee_drop_call_decoded Const.decode("employee_drop_call")

  @impl true
  def join("employee:" <> employee_id, _params, socket) do
    employee_id = Helpers.string_to_integer(employee_id)

    employee =
      ConsumerVoiceMvp.Accounts.get_user!(employee_id)
      |> Helpers.struct_to_map_drop([:__meta__, :company])

    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(employee.company_id)

    socket =
      socket
      |> assign(:employee, employee)
      |> assign(:company_id, employee.company_id)
      |> assign(:server_pid, server_pid)

    {:ok, socket}
  end

  @impl true
  def handle_in(@employee_accept_call, payload, socket) do
    %{"client_id" => client_id, "employee_connection_data" => employee_connection_data} = payload
    server_pid = socket.assigns.server_pid

    GenServer.cast(
      server_pid,
      {@employee_accept_call_decoded,
       {socket.assigns.employee.id, client_id, employee_connection_data}}
    )

    {:noreply, socket}
  end

  @impl true
  def handle_in(@employee_drop_call, %{"client_id" => client_id}, socket) do
    server_pid = socket.assigns.server_pid

    GenServer.cast(
      server_pid,
      {@employee_drop_call_decoded, {socket.assigns.employee.id, client_id}}
    )

    {:noreply, socket}
  end
end
