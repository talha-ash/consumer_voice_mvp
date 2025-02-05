defmodule ConsumerVoiceMvp.Companies do
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.{Repo, Companies, Helpers}
  import Ecto.Query, only: [from: 2]

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_in_call Const.encode(:employee_status_in_call)
  @employee_status_offline Const.encode(:employee_status_offline)
  @company_status_available Const.encode(:company_status_available)
  @company_status_busy Const.encode(:company_status_busy)
  @company_status_offline Const.encode(:company_status_offline)

  @doc """
  List All Companies.

  ## Examples

      iex> list_companies()
  """
  def list_companies() do
    Repo.all(Companies.Company)
  end

  @doc """
  Gets a single company.


  ## Examples

      iex> get_company!(123)
      %Company{}

  """
  def get_company(id), do: Repo.get(Companies.Company, id)

  def create_employee(attrs) do
    %Companies.Employee{}
    |> Companies.Employee.creation_changeset(attrs)
    |> Repo.insert()
  end

  def get_company_employees(company_id) do
    query =
      from c in Companies.Employee,
        where: c.company_id == ^company_id,
        select: c

    Repo.all(query)
  end

  def find_and_busy_employee(company_id) do
    employee = get_idle_employee(company_id)

    if employee do
      update_employee_status(employee, @employee_status_in_call)
    else
      {:not_found, "No idle employee found"}
    end
  end

  def find_and_busy_employee(company_id, black_list_employee) do
    employee = get_idle_employee(company_id, black_list_employee)

    if employee do
      update_employee_status(employee, @employee_status_in_call)
    else
      {:not_found, "No idle employee found"}
    end
  end

  def get_company_online_employees(company_id) do
    query =
      from c in Companies.Employee,
        where: c.company_id == ^company_id and c.status != @employee_status_offline,
        select: c

    Repo.all(query)
  end

  def get_company_status(company_id) do
    employees = get_company_online_employees(company_id)

    case get_online_employee_overall_status(employees) do
      @employee_status_idle -> @company_status_available
      @employee_status_in_call -> @company_status_busy
      _ -> @company_status_offline
    end
  end

  def get_online_employee_count(company_id) do
    employees = get_company_online_employees(company_id)
    Enum.count(employees)
  end

  def get_company_idle_employees(company_id) do
    query =
      from c in Companies.Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_idle,
        select: c

    Repo.all(query)
  end

  def get_idle_employee_count(company_id) do
    employees = get_company_idle_employees(company_id)
    Enum.count(employees)
  end

  def get_company_offline_employees(company_id) do
    query =
      from c in Companies.Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_offline,
        select: c

    Repo.all(query)
  end

  def update_employee_status(employee_id, company_id, status) when is_number(employee_id) do
    employee = get_employee_by_company(employee_id, company_id)

    employee
    |> Companies.Employee.update_changeset(%{status: status})
    |> Repo.update()
  end

  def update_employee_status(employee_id, status) when is_number(employee_id) do
    employee_id
    |> get_employee!()
    |> Companies.Employee.update_changeset(%{status: status})
    |> Repo.update()
  end

  def update_employee_status(employee, status) do
    employee
    |> Companies.Employee.update_changeset(%{status: status})
    |> Repo.update()
  end

  def get_employee!(id) do
    Repo.get!(Companies.Employee, id)
  end

  @doc """
  Gets a single employee map without meta.

  Raises `Ecto.NoResultsError` if the Employee does not exist.

  ## Examples

      iex> get_employee_map!(123)
      %{id: 1, ...}

      iex> get_employee_map!(456)
      ** (Ecto.NoResultsError)
  """
  # Rethink code design accessing Account context things
  def get_employee_map!(id),
    do: Repo.get!(Companies.Employee, id) |> Helpers.struct_to_map_drop([:meta, :company, :user])

  def get_employee_by_company(employee_id, company_id) do
    query =
      from c in Companies.Employee,
        where: c.id == ^employee_id and c.company_id == ^company_id,
        select: c

    Repo.one(query)
  end

  def get_employee_by_user(user_id, company_id) do
    query =
      from c in Companies.Employee,
        where: c.user_id == ^user_id and c.company_id == ^company_id,
        select: c

    Repo.one(query)
  end

  def get_idle_employee(company_id) do
    query =
      from c in Companies.Employee,
        where: c.company_id == ^company_id and c.status == @employee_status_idle,
        limit: 1,
        select: c

    Repo.one(query)
  end

  def get_idle_employee(company_id, black_list_employee) do
    query =
      from c in Companies.Employee,
        where:
          c.company_id == ^company_id and c.status == @employee_status_idle and
            c.id not in ^black_list_employee,
        limit: 1,
        select: c

    Repo.one(query)
  end

  defp get_online_employee_overall_status(employees) do
    result =
      Enum.reduce(employees, [0, 0], fn employee, acc ->
        case employee.status do
          @employee_status_idle -> List.replace_at(acc, 0, 1)
          @employee_status_in_call -> List.replace_at(acc, 1, 1)
          _ -> acc
        end
      end)

    case result do
      [1, _] -> @employee_status_idle
      [0, 1] -> @employee_status_in_call
      [0, 0] -> @employee_status_offline
    end
  end
end
