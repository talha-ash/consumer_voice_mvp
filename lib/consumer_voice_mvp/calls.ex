defmodule ConsumerVoiceMvp.Calls do
  alias ConsumerVoiceMvp.{Calls, Repo, Const}
  import Ecto.Query, only: [from: 2]

  @call_status_active Const.encode(:call_status_active)

  @call_status_waiting Const.encode(:call_status_waiting)
  @call_status_initiated Const.encode(:call_status_initiated)

  def create_call(attrs) do
    %Calls.Call{}
    |> Calls.Call.creation_changeset(attrs)
    |> Repo.insert()
  end

  def update_call_status(%{employee_id: employee_id, company_id: company_id}, status) do
    case get_non_ended_call({:employee, employee_id, company_id}) do
      {:not_found, message} ->
        {:not_found, message}

      {:ok, call} ->
        call
        |> Calls.Call.update_changeset(%{status: status})
        |> Repo.update()
    end
  end

  def update_call_status(%{client_id: client_id, company_id: company_id}, status) do
    case get_non_ended_call({:client, client_id, company_id}) do
      {:not_found, message} ->
        {:not_found, message}

      {:ok, call} ->
        call
        |> Calls.Call.update_changeset(%{status: status})
        |> Repo.update()
    end
  end

  def update_call_status(call_id, status) do
    call = get_call(call_id)

    case call do
      nil ->
        {:not_found, "Call not found against call_id: #{call_id}"}

      _ ->
        call
        |> Calls.Call.update_changeset(%{status: status})
        |> Repo.update()
    end
  end

  def get_non_ended_call({:employee, employee_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          (c.employee_id == ^employee_id and c.company_id == ^company_id and
             c.status == @call_status_active) or c.status == @call_status_waiting,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against employee_id: #{employee_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_non_ended_call({:client, client_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          (c.client_id == ^client_id and c.company_id == ^company_id and
             c.status == @call_status_active) or c.status == @call_status_waiting,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against client_id: #{client_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_non_ended_call({:session, session_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.session_id == ^session_id and c.company_id == ^company_id and
            (c.status == @call_status_active or c.status == @call_status_waiting),
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against session_id: #{session_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_active_call({:employee, employee_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.employee_id == ^employee_id and c.company_id == ^company_id and
            c.status == @call_status_active,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against employee_id: #{employee_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_active_call({:client, client_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.client_id == ^client_id and c.company_id == ^company_id and
            c.status == @call_status_active,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against client_id: #{client_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_initiated_call({:employee, employee_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.employee_id == ^employee_id and c.company_id == ^company_id and
            c.status == @call_status_initiated,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Initiated Call not found against employee_id: #{employee_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_initiated_call({:client, client_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.client_id == ^client_id and c.company_id == ^company_id and
            c.status == @call_status_initiated,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Initiated Call not found against client_id: #{client_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_waiting_call({:employee, employee_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.employee_id == ^employee_id and c.company_id == ^company_id and
            c.status == @call_status_waiting,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Waiting Call not found against employee_id: #{employee_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_waiting_call({:client, client_id, company_id}) do
    query =
      from c in Calls.Call,
        where:
          c.client_id == ^client_id and c.company_id == ^company_id and
            c.status == @call_status_waiting,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Waiting Call not found against client_id: #{client_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_call(call_id) do
    Repo.get(Calls.Call, call_id)
  end

  def get_active_call(call_id, company_id) do
    query =
      from c in Calls.Call,
        where: c.id == ^call_id and c.company_id == ^company_id and c.status == @call_status_active,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Active Call not found against call_id: #{call_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_initiated_call(call_id, company_id) do
    query =
      from c in Calls.Call,
        where: c.id == ^call_id and c.company_id == ^company_id and c.status == @call_status_initiated,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Initiated Call not found against call_id: #{call_id}"}

      call ->
        {:ok, call}
    end
  end

  def get_waiting_call(call_id, company_id) do
    query =
      from c in Calls.Call,
        where: c.id == ^call_id and c.company_id == ^company_id and c.status == @call_status_waiting,
        select: c

    case Repo.one(query) do
      nil ->
        {:not_found, "Waiting Call not found against call_id: #{call_id}"}

      call ->
        {:ok, call}
    end
  end

  def has_active_call?({:employee, employee_id, company_id}) do
    get_active_call({:employee, employee_id, company_id}) != nil
  end

  def has_active_call?({:client, client_id, company_id}) do
    get_active_call({:client, client_id, company_id}) != nil
  end

  def has_active_call?(call_id, company_id) when is_number(call_id) do
    get_active_call(call_id, company_id) != nil
  end

  def has_initiated_call?({:employee, employee_id, company_id}) do
    get_initiated_call({:employee, employee_id, company_id}) != nil
  end

  def has_initiated_call?({:client, client_id, company_id}) do
    get_initiated_call({:client, client_id, company_id}) != nil
  end

  def has_initiated_call?(call_id, company_id) when is_number(call_id) do
    get_initiated_call(call_id, company_id) != nil
  end

  def has_waiting_call?({:employee, employee_id, company_id}) do
    get_waiting_call({:employee, employee_id, company_id}) != nil
  end

  def has_waiting_call?({:client, client_id, company_id}) do
    get_waiting_call({:client, client_id, company_id}) != nil
  end

  def has_waiting_call?(call_id, company_id) when is_number(call_id) do
    get_waiting_call(call_id, company_id) != nil
  end
end
