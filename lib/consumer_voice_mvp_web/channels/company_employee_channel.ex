defmodule ConsumerVoiceMvpWeb.EmployeeCompanyChannel do
  alias ConsumerVoiceMvp.{Helpers, Const}

  use Phoenix.Channel

  @employee_company_topic Const.encode(:employee_company_topic)
  def join(@employee_company_topic <> company_id, params, socket) do
    employee_id = params["employeeId"]
    company_id = Helpers.string_to_integer(company_id)
    employee = ConsumerVoiceMvp.Accounts.get_user!(employee_id)

    {:ok, socket}
  end
end
