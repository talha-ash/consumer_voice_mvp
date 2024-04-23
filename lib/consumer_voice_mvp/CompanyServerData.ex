defmodule ConsumerVoiceMvp.CompanyServerData do
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.Accounts.{Company}

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_busy Const.encode(:employee_status_busy)
  @employee_status_offline Const.encode(:employee_status_offline)

  @company_status_available Const.encode(:company_status_available)
  @company_status_busy Const.encode(:company_status_busy)
  @company_status_offline Const.encode(:company_status_offline)

  def on_employee_online(companyServerState, employee) do
    employee = Map.put(employee, :status, @employee_status_idle)

    case employee_already_online?(companyServerState.online_employees_list, employee.id) do
      true ->
        companyServerState

      false ->
        Map.merge(companyServerState, %{
          status: @company_status_available,
          idle_employees: companyServerState.idle_employees + 1,
          online_employees_list: companyServerState.online_employees_list ++ [employee]
        })
    end
  end

  def on_employee_offline(companyServerState, employee_id) do
    online_employees_list =
      Enum.filter(companyServerState.online_employees_list, fn employee ->
        employee.id != employee_id
      end)

    is_available =
      Enum.any?(online_employees_list, fn employee ->
        employee.status == @employee_status_idle
      end)

    company_status = if is_available, do: @company_status_available, else: @company_status_busy

    companyServerState =
      Map.merge(companyServerState, %{
        status: company_status,
        idle_employees: companyServerState.idle_employees - 1,
        online_employees_list: online_employees_list
      })

    companyServerState
  end

  def employee_already_online?(online_list, employee_id) do
    Enum.any?(online_list, fn employee -> employee.id == employee_id end)
  end
end
