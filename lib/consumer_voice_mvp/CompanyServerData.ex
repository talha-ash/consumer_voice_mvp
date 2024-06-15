defmodule ConsumerVoiceMvp.CompanyServerData do
  alias ConsumerVoiceMvp.Calls
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.Companies

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_offline Const.encode(:employee_status_offline)

  @call_status_active Const.encode(:call_status_active)
  @call_status_waiting Const.encode(:call_status_waiting)
  @call_status_ended Const.encode(:call_status_ended)

  def on_employee_online(state, employee) do
    case Companies.update_employee_status(employee.id, state.company.id, @employee_status_idle) do
      {:ok, employee} ->
        employee

      {:error, message} ->
        IO.inspect(message, label: "Error updating employee status")
    end
  end

  def on_employee_offline(employee_id, company_id) do
    with {:ok, _} <-
           Companies.update_employee_status(
             employee_id,
             company_id,
             @employee_status_offline
           ),
         {:ok, call} <- update_active_calls_on_offline({:employee, employee_id, company_id}) do
      {:ok, call}
    else
      {:error, message} ->
        {:error, message}

      _ ->
        {:error, "Unable todo actions on employee offline"}
    end
  end

  def on_client_offline(client_id, company_id) do
    case update_active_calls_on_offline({:client, client_id, company_id}) do
      {:ok, call} ->
        {:ok, call}

      {:not_found, message} ->
        {:not_found, message}
    end
  end

  def on_client_call_initiate(client_id, company_id) do
    with {:ok, online_employee} <- find_and_busy_online_employee(company_id),
         _ <-
           Calls.create_call(%{
             employee_id: online_employee.employee_id,
             client_id: client_id,
             company_id: company_id
           }) do
      {:ok, online_employee}
    else
      {:error, message} ->
        {:error, message}
    end
  end

  def employee_accept_call(employee_id, company_id) do
    with {:ok, call} <- Calls.get_initiated_call({:employee, employee_id, company_id}),
         {:ok, updated_call} <- Calls.update_call_status(call.id, @call_status_active) do
      {:ok, updated_call}
    else
      {:error, message} ->
        {:error, message}
    end
  end

  def on_drop_call({:client, client_id, company_id}) do
    with {:ok, call} <- Calls.get_non_ended_call({:client, client_id, company_id}),
         {:ok, _} <- Calls.update_call_status(call.id, @call_status_ended),
         {:ok, _} <-
           Companies.update_employee_status(
             call.employee_id,
             company_id,
             @employee_status_idle
           ) do
      {:ok, call}
    else
      {:error, message} ->
        {:error, message}
    end
  end

  def on_drop_call({:employee, employee_id, company_id}) do
    with {:ok, call} <- Calls.get_non_ended_call({:employee, employee_id, company_id}),
         {:ok, _} <- Calls.update_call_status(call.id, @call_status_ended),
         {:ok, _} <-
           Companies.update_employee_status(
             employee_id,
             company_id,
             @employee_status_idle
           ) do
      {:ok, call}
    else
      {:error, message} ->
        {:error, message}
    end
  end

  defp find_and_busy_online_employee(company_id) do
    case Companies.get_busy_online_employee(company_id) do
      {:error, message} ->
        {:error, message}

      {:ok, online_employee} ->
        {:ok, online_employee}
    end
  end

  defp update_active_calls_on_offline({:employee, employee_id, company_id}) do
    with {:ok, call} <- Calls.get_active_call({:employee, employee_id, company_id}),
         {:ok, updated_call} <- Calls.update_call_status(call.id, @call_status_waiting) do
      {:ok, updated_call}
    else
      {:error, message} ->
        {:not_found, message}
    end
  end

  defp update_active_calls_on_offline({:client, client_id, company_id}) do
    with {:ok, call} <- Calls.get_active_call({:client, client_id, company_id}),
         {:ok, updated_call} <- Calls.update_call_status(call.id, @call_status_waiting) do
      {:ok, updated_call}
    else
      {:error, message} ->
        {:not_found, message}
    end
  end
end
