defmodule ConsumerVoiceMvpWeb.EmployeeCompanyChannel do
  alias Mix.Tasks.Phx.Gen
  alias ConsumerVoiceMvp.{Helpers, Const, CompanyRegistry}

  use Phoenix.Channel

  @employee_company_topic Const.encode(:employee_company_topic)

  @impl true
  def join(@employee_company_topic <> company_id, params, socket) do
    employee_id = params["employeeId"]
    company_id = Helpers.string_to_integer(company_id)
    employee = ConsumerVoiceMvp.Accounts.get_user!(employee_id)

    {:ok, pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(
      pid,
      {:on_employee_online, Helpers.struct_to_map_drop(employee, [:__meta__, :company])}
    )

    socket =
      socket
      |> assign(:employee_id, employee.id)
      |> assign(:company_id, company_id)

    {:ok, socket}
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
