defmodule ConsumerVoiceMvp.CallSessionServer do
  use GenServer
  alias ConsumerVoiceMvp.{CallSessionRegistry, CompanyRegistry, Const}

  @client_topic Const.encode(:client_topic)

  @employee_topic Const.encode(:employee_topic)

  @call_down_count_timeout Const.encode(:call_down_count_timeout)

  @br_en_on_call_session_start Const.encode(:br_en_on_call_session_start)
  @br_en_session_init Const.encode(:br_en_session_init)

  @br_en_request_employee_connection_data Const.encode(:br_en_request_employee_connection_data)
  @br_en_entity_down Const.encode(:br_en_entity_down)
  @br_en_down_count Const.encode(:br_en_down_count)

  @br_en_entity_has_call Const.encode(:br_en_entity_has_call)

  @drop_call_wait_time Const.encode(:drop_call_wait_time)

  @doc """
  Starts the CallSessionServer with the given `init_args`.

  initial state = %{
      session_id: call.session_id,
      company_id: state.company.id,
      client_id: client_id,
      employee_id: employee_id,
      t_ref: nil,
      down_count: 0,
      is_down: false,
      client: %{channel: nil,pid: nil,init_complete: false},
      employee: %{channel: nil,pid: nil,init_complete: false}
    }
  """
  def start(init_args) do
    IO.inspect("How many time call If there is race condition", label: "CallSessionServer")
    GenServer.start(__MODULE__, init_args, name: CallSessionRegistry.via_tuple(init_args.session_id))
  end

  @impl true
  def init(init_args) do
    # trap_exit to trap non-kill error messages coming from the channel PIDs
    # Process.flag(:trap_exit, true)
    {:ok, company_server_pid} = CompanyRegistry.company_pid_lookup(init_args.company_id)
    member_state = %{channel: nil, pid: nil, init_complete: false}

    state =
      Map.merge(
        init_args,
        %{
          t_ref: nil,
          down_count: 0,
          client: member_state,
          employee: member_state,
          is_down: false,
          company_server_pid: company_server_pid
        }
      )

    # send(self(), :timer_count)
    send(self(), :on_init)
    {:ok, state}
  end

  # Call this when a channel connects
  def track_channel(pid, join_by, socket = %Phoenix.Socket{}) do
    GenServer.cast(pid, {:track, join_by, socket})
  end

  def state(pid) do
    GenServer.call(pid, :state)
  end

  def connection_data(pid, params) do
    GenServer.cast(pid, params)
  end

  def client_init_complete(pid) do
    GenServer.cast(pid, :client_init_complete)
  end

  def employee_init_complete(pid) do
    GenServer.cast(pid, :employee_init_complete)
  end

  ## Callbacks
  @impl true
  def handle_info(:on_init, state) do
    IO.inspect("timer_count", label: "timer_count")
    IO.inspect(state, label: "state")
    IO.puts("Timer: #{DateTime.utc_now()}")
    broadcast_call_session_start(state)
    {:noreply, state}
  end

  # @impl true
  # def handle_info(:timer_count, state) do
  #   IO.inspect("timer_count", label: "timer_count")
  #   IO.inspect(state, label: "state")
  #   IO.puts("Timer: #{DateTime.utc_now()}")
  #   {:noreply, state}
  # end

  @impl true
  def handle_info(:down_count, state) do
    state = %{state | down_count: state.down_count + 1}
    IO.inspect("timer_count", label: "timer_count")
    IO.inspect(state, label: "state")
    IO.puts("Timer: #{DateTime.utc_now()}")

    if state.down_count <= @drop_call_wait_time do
      broadcast_down_count(state.session_id, state.down_count)
      broadcast_entity_has_call(state)
      {:noreply, state}
    else
      GenServer.cast(
        state.company_server_pid,
        {@call_down_count_timeout, {state.session_id, state.employee_id}}
      )

      {:stop, {:shutdown, "down_count_timeout"}, state}
    end
  end

  # The channel pid just went offline. Could handle some type of callback here
  # @impl true
  # def handle_info({:EXIT, _pid, reason}, state) do

  #   IO.inspect("Call Session Servcer Stop Reason #{reason}", label: "Exit reason")
  #   {:noreply, state}
  # end

  @impl true
  def handle_info({:DOWN, _ref, :process, pid, reason}, state) do
    IO.inspect("DOWN", label: "DOWN")
    IO.inspect(reason, label: "channel down reason")

    broadcast_entity_down(state.session_id)
    {:ok, tRef} = :timer.send_interval(6_000, self(), :down_count)

    member_state = %{channel: nil, pid: nil, init_complete: false}

    state =
      case info_about_drop_entity(state, pid) do
        {:client, _client} ->
          Map.merge(state, %{
            client: member_state,
            employee: %{state.employee | init_complete: false},
            t_ref: tRef,
            down_count: 0,
            is_down: true
          })

        {:employee, _employee} ->
          Map.merge(state, %{
            employee: member_state,
            client: %{state.client | init_complete: false},
            t_ref: tRef,
            down_count: 0,
            is_down: true
          })
      end

    {:noreply, state}
  end

  @impl true
  def handle_cast({:client, connection_data}, state = %{client: client}) do
    client = Map.put(client, :connection_data, connection_data)
    state = Map.put(state, :client, client)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:employee, connection_data}, state = %{employee: employee}) do
    employee = Map.put(employee, :connection_data, connection_data)
    state = Map.put(state, :employee, employee)

    {:noreply, state}
  end

  @impl true
  def handle_cast(:client_init_complete, state = %{client: client}) do
    client = Map.put(client, :init_complete, true)
    state = Map.put(state, :client, client)

    if is_both_init_complete?(state) do
      broadcast_request_employee_connection_data(state.session_id)
    end

    {:noreply, state}
  end

  @impl true
  def handle_cast(:employee_init_complete, state = %{employee: employee}) do
    employee = Map.put(employee, :init_complete, true)
    state = Map.put(state, :employee, employee)

    if is_both_init_complete?(state) do
      broadcast_request_employee_connection_data(state.session_id)
    end

    {:noreply, state}
  end

  @impl true
  def handle_cast(
        {:track, join_by, _socket = %Phoenix.Socket{channel_pid: pid, topic: topic}},
        state
      ) do
    link_processes_to_capture_bidirectional_exits(pid)

    join_by = String.to_existing_atom(join_by)

    state =
      Map.put(state, join_by, %{
        channel: topic,
        pid: pid,
        init_complete: false
      })

    case is_rejoin?(state.t_ref) do
      true ->
        state = on_rejoin(state)
        {:noreply, state}

      false ->
        if is_both_joined?(state) do
          broadcast_call_session_init(state.session_id)
        end

        {:noreply, state}
    end
  end

  @impl true
  def handle_call(:state, _from, state) do
    {:reply, state, state}
  end

  # Link allows exit trapping
  @impl true
  def terminate(reason, state) do
    IO.inspect("CallSessionServer terminated", label: "CallSessionServer")
    IO.inspect(reason, label: "reason server terminate")
    IO.inspect(state, label: "state")
    :ok
  end

  # private functions

  defp link_processes_to_capture_bidirectional_exits(pid), do: Process.monitor(pid)

  defp is_both_init_complete?(state) do
    state.client.init_complete == true && state.employee.init_complete == true
  end

  defp is_both_joined?(state) do
    state.client.pid != nil && state.employee.pid != nil
  end

  defp broadcast_call_session_init(session_id) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "call:#{session_id}",
      @br_en_session_init,
      %{}
    )
  end

  defp broadcast_entity_has_call(state) do
    if state.client.channel == nil do
      ConsumerVoiceMvpWeb.Endpoint.broadcast!(
        "#{@client_topic}#{state.client_id}",
        @br_en_entity_has_call,
        %{session_id: state.session_id}
      )
    end

    if state.employee.channel == nil do
      ConsumerVoiceMvpWeb.Endpoint.broadcast!(
        "#{@employee_topic}#{state.employee_id}",
        @br_en_entity_has_call,
        %{session_id: state.session_id}
      )
    end
  end

  defp broadcast_call_session_start(params) do
    %{
      employee_id: employee_id,
      client_id: client_id,
      session_id: session_id
    } = params

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_en_on_call_session_start,
      %{client_id: client_id, session_id: session_id}
    )

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_topic}#{client_id}",
      @br_en_on_call_session_start,
      %{
        employee_id: employee_id,
        session_id: session_id
      }
    )
  end

  defp on_rejoin(state) do
    case is_both_joined?(state) do
      true ->
        :timer.cancel(state.t_ref)
        broadcast_call_session_init(state.session_id)
        %{state | t_ref: nil, down_count: 0, is_down: false}

      _ ->
        state
    end
  end

  defp broadcast_request_employee_connection_data(session_id) do
    channel_topic = "call:#{session_id}"

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(channel_topic, @br_en_request_employee_connection_data, %{})
  end

  defp broadcast_entity_down(session_id) do
    channel_topic = "call:#{session_id}"

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(channel_topic, @br_en_entity_down, %{})
  end

  defp broadcast_down_count(session_id, down_count) do
    channel_topic = "call:#{session_id}"

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(channel_topic, @br_en_down_count, %{down_count: down_count})
  end

  defp info_about_drop_entity(state, pid) do
    if state.client.pid == pid do
      {:client, state.client}
    else
      {:employee, state.employee}
    end
  end

  defp is_rejoin?(t_ref) do
    t_ref != nil
  end
end
