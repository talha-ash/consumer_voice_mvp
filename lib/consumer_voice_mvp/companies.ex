defmodule ConsumerVoiceMvp.Companies do
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.{Repo, Companies}
  import Ecto.Query, only: [from: 2]

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_in_call Const.encode(:employee_status_in_call)
  @employee_status_offline Const.encode(:employee_status_offline)

  def create_employee(attrs) do
    %Companies.Online_Employee{}
    |> Companies.Online_Employee.creation_changeset(attrs)
    |> Repo.insert()
  end

  def get_company_employees(company_id) do
    query =
      from c in Companies.Online_Employee,
        where: c.company_id == ^company_id,
        select: c

    Repo.all(query)
  end

  def get_busy_online_employee(company_id) do
    employee = get_idle_employee(company_id)

    if employee do
      update_employee_status(employee, @employee_status_in_call)
    else
      {:error, "No employee found"}
    end
  end

  def get_company_online_employees(company_id) do
    query =
      from c in Companies.Online_Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_idle,
        select: c

    Repo.all(query)
  end

  def get_online_employee_count(company_id) do
    employees = get_company_online_employees(company_id)
    Enum.count(employees)
  end

  def get_company_offline_employees(company_id) do
    query =
      from c in Companies.Online_Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_offline,
        select: c

    Repo.all(query)
  end

  def update_employee_status(employee_id, company_id, status) when is_number(employee_id) do
    employee = get_employee_by_company(employee_id, company_id)

    employee
    |> Companies.Online_Employee.update_changeset(%{status: status})
    |> Repo.update()
  end

  def update_employee_status(employee, status) do
    employee
    |> Companies.Online_Employee.update_changeset(%{status: status})
    |> Repo.update()
  end

  def get_employee!(id) do
    Repo.get!(Companies.Online_Employee, id)
  end

  def get_employee_by_company(employee_id, company_id) do
    query =
      from c in Companies.Online_Employee,
        where: c.employee_id == ^employee_id and c.company_id == ^company_id,
        select: c

    Repo.all(query)
  end

  def get_idle_employee(company_id) do
    query =
      from c in Companies.Online_Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_idle,
        limit: 1,
        select: c

    Repo.one(query)
  end
end
