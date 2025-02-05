defmodule ConsumerVoiceMvp.CallRequestServer do
  use GenServer
  alias ConsumerVoiceMvp.Calls
  alias ConsumerVoiceMvp.{CompanyRegistry, CompanyServerData, Const, Companies}
  alias ConsumerVoiceMvpWeb

  @br_en_client_call_request_timeout Const.encode(:br_en_client_call_request_timeout)
  @client_call_initiate Const.encode(:client_call_initiate)
  @client_reject_call_request Const.encode(:client_reject_call_request)
  @client_topic Const.encode(:client_topic)
  @employee_topic Const.encode(:employee_topic)
  @employee_reject_call_request Const.encode(:employee_reject_call_request)
  @employee_status_idle Const.encode(:employee_status_idle)
  @br_en_client_call_cancel Const.encode(:br_en_client_call_cancel)
  @call_status_ended Const.encode(:call_status_ended)

  @doc """
  Starts the CallRequestServer with the given `init_args`.

  initial state = %{
      company_id: state.company.id,
      client_id: client_id,
      employee_id: employee_id,
      t_ref: nil,
      down_count: 0,
      is_down: false,
    }
  """
  def start_link(init_args) do
    GenServer.start_link(__MODULE__, init_args, name: CompanyRegistry.add_call_request_pid(init_args.client.id))
  end

  @impl true
  def init(init_args) do
    # trap_exit to trap non-kill error messages coming from the channel PIDs
    # Process.flag(:trap_exit, true)
    {:ok, company_server_pid} = CompanyRegistry.company_pid_lookup(init_args.company_id)

    state =
      Map.merge(
        init_args,
        %{
          request_call_t_ref: nil,
          request_call_count_down: 0,
          employee_call_accepting_t_ref: nil,
          employee_call_accepting_count_down: 0,
          current_employee: nil,
          client: init_args.client,
          company_id: init_args.company_id,
          company_server_pid: company_server_pid,
          black_list_employee: []
        }
      )

    send(self(), :on_init)
    {:ok, state}
  end

  ## Callbacks
  @impl true
  def handle_info(:on_init, state) do
    IO.inspect("CallRequestServer: on_init", label: "CallRequestServer")

    state = initiate_call_request(state)

    {:noreply, state}
  end

  @impl true
  def handle_info(:employee_call_accepting_count_down, state) do
    client_id = state.client.id
    company_id = state.company_id
    state = %{state | employee_call_accepting_count_down: state.employee_call_accepting_count_down + 1}
    IO.inspect("employee_call_accepting_count_down", label: "employee_call_accepting_count_down")
    IO.puts("Timer: #{DateTime.utc_now()}")
    IO.inspect(state, label: "state")

    if(state.employee_call_accepting_count_down > 4) do
      :timer.cancel(state.employee_call_accepting_t_ref)
      Calls.update_call_status(%{client_id: client_id, company_id: company_id}, @call_status_ended)
      broadcast_employee_for_call_cancel(state.current_employee.id, company_id)
      state = request_other_employee(state)
      {:noreply, state}
    else
      {:noreply, state}
    end
  end

  @impl true
  def handle_info(:request_call_count_down, state) do
    state = %{state | request_call_count_down: state.request_call_count_down + 1}
    IO.inspect("request_call_count_down", label: "request_call_count_down")
    IO.puts("Timer: #{DateTime.utc_now()}")
    IO.inspect(state, label: "state")

    if(state.request_call_count_down > 10) do
      :timer.cancel(state.request_call_t_ref)
      broadcast_call_request_timeout(state.client.id)
      {:stop, :normal, state}
    else
      client_id = state.client.id
      company_id = state.company_id
      black_list_employee = state.black_list_employee

      case CompanyServerData.request_other_employee(client_id, company_id, black_list_employee) do
        {:ok, employee} ->
          :timer.cancel(state.request_call_t_ref)
          {:ok, tRef} = :timer.send_interval(10_000, self(), :employee_call_accepting_count_down)
          broadcast_employee_for_call(employee.id, client_id)

          state =
            Map.merge(state, %{
              current_employee: employee,
              employee_call_accepting_t_ref: tRef,
              employee_call_accepting_count_down: 0,
              request_call_t_ref: nil,
              request_call_count_down: 0,
              black_list_employee: [employee.id]
            })

          {:noreply, state}

        {:not_found, _message} ->
          # state = %{state | black_list_employee: []}
          {:noreply, state}
      end
    end
  end

  @impl true
  def handle_cast({@employee_reject_call_request}, state) do
    client_id = state.client.id
    company_id = state.company_id
    :timer.cancel(state.employee_call_accepting_t_ref)
    Calls.update_call_status(%{client_id: client_id, company_id: company_id}, @call_status_ended)
    state = request_other_employee(state)
    {:noreply, state}
  end

  @impl true
  def handle_cast({@client_reject_call_request}, state) do
    client_id = state.client.id
    company_id = state.company_id

    case state.employee_call_accepting_t_ref do
      nil ->
        {:stop, :normal, state}

      _ ->
        :timer.cancel(state.employee_call_accepting_t_ref)
        Companies.update_employee_status(state.current_employee.id, @employee_status_idle)
        Calls.update_call_status(%{client_id: client_id, company_id: company_id}, @call_status_ended)
        broadcast_employee_for_call_cancel(state.current_employee.id, client_id)
        {:stop, :normal, state}
    end
  end

  @impl true
  def handle_cast({:on_employee_call_accepting, employee_id}, state) do
    client_id = state.client.id
    company_id = state.company_id

    {:ok, call} =
      CompanyServerData.employee_accept_call(
        employee_id: employee_id,
        client_id: client_id,
        company_id: company_id
      )

    ConsumerVoiceMvp.CallSessionServer.start(%{
      session_id: call.session_id,
      company_id: company_id,
      client_id: client_id,
      employee_id: employee_id
    })

    {:stop, :normal, state}
  end

  defp initiate_call_request(state) do
    client_id = state.client.id
    company_id = state.company_id

    case CompanyServerData.on_client_call_initiate(client_id, company_id) do
      {:ok, employee} ->
        {:ok, tRef} = :timer.send_interval(10_000, self(), :employee_call_accepting_count_down)
        broadcast_employee_for_call(employee.id, state.client)

        Map.merge(state, %{
          current_employee: employee,
          employee_call_accepting_t_ref: tRef,
          employee_call_accepting_count_down: 0,
          black_list_employee: [employee.id]
        })

      {:not_found, _message} ->
        {:ok, tRef} = :timer.send_interval(4_000, self(), :request_call_count_down)

        Map.merge(state, %{
          current_employee: nil,
          employee_call_accepting_t_ref: nil,
          request_call_t_ref: tRef,
          request_call_count_down: 0
        })

      {:error, reason} ->
        IO.inspect(reason, label: "reason")
        {:error, reason}
    end
  end

  defp request_other_employee(state) do
    client_id = state.client.id
    company_id = state.company_id
    black_list_employee = state.black_list_employee

    case CompanyServerData.request_other_employee(client_id, company_id, black_list_employee) do
      {:ok, employee} ->
        {:ok, tRef} = :timer.send_interval(10_000, self(), :employee_call_accepting_count_down)
        broadcast_employee_for_call(employee.id, state.client)

        Map.merge(state, %{
          current_employee: employee,
          employee_call_accepting_t_ref: tRef,
          employee_call_accepting_count_down: 0,
          black_list_employee: [employee.id | state.black_list_employee]
        })

      {:not_found, _message} ->
        {:ok, tRef} = :timer.send_interval(4_000, self(), :request_call_count_down)

        Map.merge(state, %{
          current_employee: nil,
          employee_call_accepting_t_ref: nil,
          request_call_t_ref: tRef,
          request_call_count_down: 0
        })

      {:error, reason} ->
        IO.inspect(reason, label: "reason")
        {:error, reason}
    end
  end

  defp broadcast_employee_for_call(employee_id, client) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @client_call_initiate,
      %{client: client}
    )
  end

  defp broadcast_employee_for_call_cancel(employee_id, client) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_en_client_call_cancel,
      %{client: client}
    )
  end

  defp broadcast_call_request_timeout(client_id) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_topic}#{client_id}",
      @br_en_client_call_request_timeout,
      %{}
    )
  end
end
