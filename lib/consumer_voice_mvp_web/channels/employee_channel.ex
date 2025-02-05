defmodule ConsumerVoiceMvpWeb.EmployeeChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.{Helpers, CompanyRegistry}

  @impl true
  def join("employee:" <> employee_id, _params, socket) do
    employee_id = Helpers.string_to_integer(employee_id)

    employee =
      ConsumerVoiceMvp.Companies.get_employee!(employee_id)
      |> Helpers.struct_to_map_drop([:__meta__, :company])

      IO.inspect(employee, label: "employee")
    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(employee.company_id)

    socket =
      socket
      |> assign(:employee, employee)
      |> assign(:company_id, employee.company_id)
      |> assign(:server_pid, server_pid)

    {:ok, socket}
  end
end
