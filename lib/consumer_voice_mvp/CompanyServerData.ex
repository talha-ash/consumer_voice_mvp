defmodule ConsumerVoiceMvp.CompanyServerData do
  alias ConsumerVoiceMvp.Sqids
  alias ConsumerVoiceMvp.Calls
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.Companies

  @employee_status_idle Const.encode(:employee_status_idle)
  @employee_status_offline Const.encode(:employee_status_offline)

  @call_status_waiting Const.encode(:call_status_waiting)
  @call_status_ended Const.encode(:call_status_ended)
  @call_status_active Const.encode(:call_status_active)

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

      {:not_found, message} ->
        {:ok, message}

      _ ->
        {:error, "Unable todo actions on employee offline"}
    end
  end

  def on_client_offline(client_id, company_id) do
    case update_active_calls_on_offline({:client, client_id, company_id}) do
      {:ok, call} ->
        {:ok, call}

      {:error, message} ->
        {:error, message}
    end
  end

  def on_client_call_initiate(client_id, company_id) do
    with {:ok, employee} <- find_and_busy_employee(company_id),
         _ <-
           Calls.create_call(%{
             employee_id: employee.id,
             client_id: client_id,
             company_id: company_id
           }) do
      {:ok, employee}
    else
      {:not_found, message} ->
        {:not_found, message}

      {:error, message} ->
        {:error, message}
    end
  end

  def request_other_employee(client_id, company_id, black_list_employee) do
    Companies.update_employee_status(List.first(black_list_employee), @employee_status_idle)

    with {:ok, employee} <- find_and_busy_employee(company_id, black_list_employee),
         _ <-
           Calls.create_call(%{
             employee_id: employee.id,
             client_id: client_id,
             company_id: company_id
           }) do
      {:ok, employee}
    else
      {:not_found, message} ->
        {:not_found, message}

      {:error, message} ->
        {:error, message}
    end
  end

  @doc """
  Creates a new call record and associates it with an employee, client, and company.

  ## Parameters

    - `employee_id` (integer): The ID of the employee handling the call.
    - `client_id` (integer): The ID of the client involved in the call.
    - `company_id` (integer): The ID of the company associated with the call.

  ## Returns

    - `{:ok, call}`: On success, returns a tuple with the atom `:ok` and the newly created `call` struct.
    - `{:error, message}`: On failure, returns a tuple with the atom `:error` and an error message explaining the reason for failure.

  ## Examples

      iex> MyApp.Calls.employee_accept_call(123, 456, 789)
      {:ok, %Call{...}}

      iex> MyApp.Calls.employee_accept_call(123, nil, 789)
      {:error, "Client ID is required"}
  """
  def employee_accept_call(employee_id: employee_id, client_id: client_id, company_id: company_id) do
    session_id =
      Sqids.encode_for_session_id!(
        employee_id: employee_id,
        client_id: client_id,
        company_id: company_id
      )

    with {:ok, call} <-
           Calls.create_call(%{
             employee_id: employee_id,
             client_id: client_id,
             company_id: company_id,
             session_id: session_id,
             status: @call_status_active
           }) do
      {:ok, call}
    else
      {:error, message} ->
        {:error, message}
    end
  end

  @doc """
  Handles the logic when a client drops a call.

  This function performs the following steps:

    1. Fetches the non-ended call associated with the given `client_id` and `company_id`.
    2. Updates the call status to `@call_status_ended` (presumably indicating the call has ended).
    3. Updates the status of the employee associated with the call to `@employee_status_idle`.

  ## Parameters

    - `{:client, client_id, company_id}` (tuple): A tuple containing:
        - `:client` (atom): Indicates that the call is being dropped by the client.
        - `client_id` (integer): The ID of the client dropping the call.
        - `company_id` (integer): The ID of the company associated with the call.

  ## Returns

    - `{:ok, call}`: On success, returns a tuple with the atom `:ok` and the updated `call` struct.
    - `{:error, message}`: On failure, returns a tuple with the atom `:error` and a detailed error message explaining the reason for failure.

  ## Error Handling

    This function uses a `with` statement to ensure that each step is successful before proceeding. If any of the following conditions occur, an error is returned:

      - The non-ended call for the given client and company cannot be found.
      - The call status update fails.
      - The employee status update fails.

    The returned error message will provide a specific indication of which step failed.

  ## Example

      iex> MyApp.Calls.on_terminate_call({:client, 123, 456})
      {:ok, %Call{...}}

      iex> MyApp.Calls.on_terminate_call({:client, 999, 456})
      {:error, "No non-ended call found for client 999 in company 456"}
  """
  def on_terminate_call({:client, client_id, company_id}) do
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
      {:not_found, message} ->
        {:error, message}
    end
  end

  def on_terminate_call({:employee, employee_id, company_id}) do
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
      {:not_found, message} ->
        {:error, message}
    end
  end

  @doc """
    Drops a call associated with the given `session_id` and `company_id`. By Server Internally.

    This function performs the following steps:

      1. Fetches the non-ended call associated with the given `session_id` and `company_id`.
      2. Updates the call status to `@call_status_ended` (presumably indicating the call has ended).
      3. Updates the status of the employee associated with the call to `@employee_status_idle`.

    ## Parameters

      - `session_id` (string): The session ID of the call to be dropped.
      - `company_id` (integer): The ID of the company associated with the call.

    ## Returns

      - `{:ok, call}`: On success, returns a tuple with the atom `:ok` and the updated `call` struct.
      - `{:error, message}`: On failure, returns a tuple with the atom `:error` and a detailed error message explaining the reason for failure.

    ## Error Handling

      This function uses a `with` statement to ensure that each step is successful before proceeding. If any of the following conditions occur, an error is returned:

        - The non-ended call for the given session and company cannot be found.
        - The call status update fails.
        - The employee status update fails.

      The returned error message will provide a specific indication of which step failed.

    ## Example

        iex> MyApp.Calls.drop_call("abc123", 456)
        {:ok, %Call{...}}

        iex> MyApp.Calls.drop_call("xyz789", 456)
        {:error, "No non-ended call found for session xyz789 in company 456"}
  """
  def drop_call(session_id, company_id) do
    with {:ok, call} <- Calls.get_non_ended_call({:session, session_id, company_id}),
         {:ok, _} <- Calls.update_call_status(call.id, @call_status_ended),
         {:ok, _} <-
           Companies.update_employee_status(
             call.employee_id,
             company_id,
             @employee_status_idle
           ) do
      {:ok, call}
    else
      {:not_found, message} ->
        {:error, message}
    end
  end

  defp find_and_busy_employee(company_id) do
    Companies.find_and_busy_employee(company_id)
  end

  defp find_and_busy_employee(company_id, black_list_employee) do
    Companies.find_and_busy_employee(company_id, black_list_employee)
  end

  defp update_active_calls_on_offline({:employee, employee_id, company_id}) do
    with {:ok, call} <- Calls.get_active_call({:employee, employee_id, company_id}),
         {:ok, updated_call} <- Calls.update_call_status(call.id, @call_status_waiting) do
      {:ok, updated_call}
    else
      {:not_found, message} ->
        {:error, message}
    end
  end

  defp update_active_calls_on_offline({:client, client_id, company_id}) do
    with {:ok, call} <- Calls.get_active_call({:client, client_id, company_id}),
         {:ok, updated_call} <- Calls.update_call_status(call.id, @call_status_waiting) do
      {:ok, updated_call}
    else
      {:not_found, message} ->
        {:error, message}
    end
  end
end
