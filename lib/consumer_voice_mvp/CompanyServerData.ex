defmodule ConsumerVoiceMvp.CompanyServerData do
  alias ConsumerVoiceMvp.Const

  @employee_status_idle Const.encode(:employee_status_idle)

  @company_status_available Const.encode(:company_status_available)
  @company_status_busy Const.encode(:company_status_busy)
  @company_status_offline Const.encode(:company_status_offline)

  @call_status_initiated Const.encode(:call_status_initiated)
  @call_status_ative Const.encode(:call_status_ative)

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

    case update_active_calls_on_offline({:employee, employee_id}, companyServerState.active_calls) do
      {:not_found, _active_calls} ->
        companyServerState =
          Map.merge(companyServerState, %{
            status: company_status(online_employees_list),
            idle_employees: companyServerState.idle_employees - 1,
            online_employees_list: online_employees_list
          })

        {:call_unfound, companyServerState}

      {:ok, active_calls, call} ->
        companyServerState =
          Map.merge(companyServerState, %{
            status: company_status(online_employees_list),
            idle_employees: companyServerState.idle_employees - 1,
            online_employees_list: online_employees_list,
            active_calls: active_calls
          })

        {:call_found, companyServerState, call}
    end
  end

  def on_client_online(companyServerState, client) do
    case client_already_queue?(companyServerState.client_queue, client.id) do
      true ->
        companyServerState

      false ->
        Map.merge(companyServerState, %{
          client_queue: companyServerState.client_queue ++ [client]
        })
    end
  end

  def on_client_offline(companyServerState, client_id) do
    client_queue =
      Enum.filter(companyServerState.client_queue, fn client ->
        client.id != client_id
      end)

    case update_active_calls_on_offline({:client, client_id}, companyServerState.active_calls) do
      {:not_found, _active_calls} ->
        companyServerState =
          Map.merge(companyServerState, %{
            client_queue: client_queue
          })

        {:call_unfound, companyServerState}

      {:ok, active_calls, call} ->
        online_employees_list =
          set_employee_status(
            companyServerState.online_employees_list,
            call.employee_id,
            @employee_status_idle
          )

        companyServerState =
          Map.merge(companyServerState, %{
            client_queue: client_queue,
            active_calls: active_calls,
            online_employees_list: online_employees_list
          })

        {:call_found, companyServerState, call}
    end
  end

  def on_client_call_initiate(%{idle_employees: 0}, _client_id) do
    {:error, "No employee available"}
  end

  def on_client_call_initiate(companyServerState, client_id) do
    online_employees_list = companyServerState.online_employees_list

    case find_and_busy_employee_from_list(online_employees_list) do
      %{employee: nil} ->
        {:error, "No employee available"}

      %{employee: employee, online_employees_list: online_employees_list} ->
        companyServerState =
          Map.merge(companyServerState, %{
            status: company_status(online_employees_list),
            idle_employees: companyServerState.idle_employees - 1,
            online_employees_list: online_employees_list,
            active_calls:
              add_to_active_calls(companyServerState.active_calls, employee.id, client_id)
          })

        {:ok, companyServerState, employee}
    end
  end

  def employee_accept_call(companyServerState, client_id, employee_id) do
    companyServerState =
      Map.merge(companyServerState, %{
        active_calls:
          Map.update!(
            companyServerState.active_calls,
            make_active_calls_key(employee_id, client_id),
            fn call ->
              Map.put(call, :status, @call_status_ative)
            end
          )
      })

    companyServerState
  end

  def on_drop_call(companyServerState, client_id, nil) do
    key = get_active_call_key({:client, client_id}, companyServerState.active_calls)

    call = Map.get(companyServerState.active_calls, key)
    employee_id = call.employee_id

    online_employees_list =
      set_employee_status(
        companyServerState.online_employees_list,
        employee_id,
        @employee_status_idle
      )

    companyServerState =
      Map.merge(companyServerState, %{
        status: company_status(online_employees_list),
        idle_employees: companyServerState.idle_employees + 1,
        active_calls:
          Map.delete(
            companyServerState.active_calls,
            make_active_calls_key(employee_id, client_id)
          ),
        online_employees_list: online_employees_list
      })

    {companyServerState, employee_id}
  end

  def on_drop_call(companyServerState, client_id, employee_id) do
    online_employees_list =
      set_employee_status(
        companyServerState.online_employees_list,
        employee_id,
        @employee_status_idle
      )

    Map.merge(companyServerState, %{
      status: company_status(online_employees_list),
      idle_employees: companyServerState.idle_employees + 1,
      active_calls:
        Map.delete(companyServerState.active_calls, make_active_calls_key(employee_id, client_id)),
      online_employees_list: online_employees_list
    })
  end

  defp set_employee_status(online_employees_list, employee_id, status) do
    Enum.map(online_employees_list, fn employee ->
      if employee.id == employee_id do
        Map.put(employee, :status, status)
      else
        employee
      end
    end)
  end

  defp employee_already_online?(online_list, employee_id) do
    Enum.any?(online_list, fn employee -> employee.id == employee_id end)
  end

  defp client_already_queue?(client_queue, client_id) do
    Enum.any?(client_queue, fn client -> client.id == client_id end)
  end

  defp company_status(online_employees_list) do
    is_available =
      Enum.any?(online_employees_list, fn employee ->
        employee.status == @employee_status_idle
      end)

    cond do
      Enum.count(online_employees_list) == 0 -> @company_status_offline
      is_available -> @company_status_available
      true -> @company_status_busy
    end
  end

  defp find_and_busy_employee_from_list(online_employees_list) do
    Enum.reduce(
      online_employees_list,
      %{online_employees_list: [], employee: nil},
      fn employee, acc ->
        if employee.status == @employee_status_idle do
          online_employees_list = Map.get(acc, :online_employees_list) ++ [employee]

          acc
          |> Map.put(:employee, employee)
          |> Map.put(:online_employees_list, online_employees_list)
        else
          acc |> Map.put(:online_employees_list, online_employees_list)
        end
      end
    )
  end

  defp add_to_active_calls(active_calls, employee_id, client_id) do
    key = make_active_calls_key(employee_id, client_id)

    Map.put(active_calls, key, %{
      employee_id: employee_id,
      client_id: client_id,
      status: @call_status_initiated
    })
  end

  defp make_active_calls_key(employee_id, client_id) do
    "#{employee_id}_#{client_id}"
  end

  defp update_active_calls_on_offline({:employee, employee_id}, active_calls) do
    case key = get_active_call_key({:employee, employee_id}, active_calls) do
      nil ->
        {:not_found, active_calls}

      _ ->
        call = Map.get(active_calls, key)
        active_calls = Map.delete(active_calls, key)
        {:ok, active_calls, call}
    end
  end

  defp update_active_calls_on_offline({:client, client_id}, active_calls) do
    case key = get_active_call_key({:client, client_id}, active_calls) do
      nil ->
        {:not_found, active_calls}

      _ ->
        call = Map.get(active_calls, key)
        active_calls = Map.delete(active_calls, key)
        {:ok, active_calls, call}
    end
  end

  defp get_active_call_key({:employee, employee_id}, active_calls) do
    Enum.reduce(active_calls, nil, fn {key, call}, acc ->
      if call.employee_id == employee_id do
        key
      else
        acc
      end
    end)
  end

  defp get_active_call_key({:client, client_id}, active_calls) do
    Enum.reduce(active_calls, nil, fn {key, call}, acc ->
      if call.client_id == client_id do
        key
      else
        acc
      end
    end)
  end
end
