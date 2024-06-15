defmodule ConsumerVoiceMvpWeb.EmployeeChannel do
  use Phoenix.Channel
  alias ConsumerVoiceMvp.{Helpers, Const, CompanyRegistry}

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
end
