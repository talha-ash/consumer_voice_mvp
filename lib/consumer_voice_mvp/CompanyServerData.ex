defmodule ConsumerVoiceMvp.CompanyServerData do
  alias ConsumerVoiceMvp.Const

  defmodule CompanyServerState do
    defstruct status: nil, idle_employees: nil, client_queue: [], online_employees_list: []
  end

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_busy Const.encode(:employee_status_busy)
  @employee_status_offline Const.encode(:employee_status_offline)

  @company_status_available Const.encode(:company_status_available)
  @company_status_busy Const.encode(:company_status_busy)
  @company_status_offline Const.encode(:company_status_offline)

  def on_employee_online(companyServerState = %CompanyServerState{}, employee) do
    employee = Map.put(employee, :status, @employee_status_idle)

    companyServerState =
      Map.merge(companyServerState, %CompanyServerState{
        status: @company_status_available,
        idle_employees: companyServerState.idle_employees + 1,
        online_employees_list: companyServerState.online_employees_list ++ [employee]
      })

    companyServerState
  end

  def on_employee_offline(companyServerState = %CompanyServerState{}, employee_id) do
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
      Map.merge(companyServerState, %CompanyServerState{
        status: company_status,
        idle_employees: companyServerState.idle_employees - 1,
        online_employees_list: online_employees_list
      })

    companyServerState
  end
end
