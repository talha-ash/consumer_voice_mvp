defmodule ConsumerVoiceMvp.CallSessionServer do
  use GenServer
  alias ConsumerVoiceMvp.{CallSessionRegistry, Const}

  @client_topic Const.encode(:client_topic)

  @employee_topic Const.encode(:employee_topic)

  @br_en_on_call_session_start Const.encode(:br_en_on_call_session_start)
  @br_en_session_init Const.encode(:br_en_session_init)
  @br_en_employee_connection_data Const.encode(:br_en_employee_connection_data)
  @br_en_request_employee_connection_data Const.encode(:br_en_request_employee_connection_data)

  def start_link(init_args) do
    IO.inspect("How many time call If there is race condition", label: "CallSessionServer")
    GenServer.start_link(__MODULE__, init_args, name: CallSessionRegistry.via_tuple(init_args.session_id))
  end

  @impl true
  def init(init_args) do
    # trap_exit to trap non-kill error messages coming from the channel PIDs
    # Process.flag(:trap_exit, true)

    :timer.send_interval(10_000, self(), :timer_count)

    member_state = %{channel: nil, pid: nil, init_complete: false}

    state = init_args |> Map.put(:client, member_state) |> Map.put(:employee, member_state)

    send(self(), :timer_count)
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

  @impl true
  def handle_info(:timer_count, state) do
    IO.inspect("timer_count", label: "timer_count")
    IO.inspect(state, label: "state")
    IO.puts("Timer: #{DateTime.utc_now()}")
    {:noreply, state}
  end

  # The channel pid just went offline. Could handle some type of callback here
  @impl true
  def handle_info({:EXIT, pid, reason}, state = %{channel_pids: pids}) do
    new_channel_pids = Map.delete(pids, pid)
    IO.inspect("Channel went offline", label: "Exit reason")
    IO.inspect(reason, label: "reason param")
    IO.inspect(pid, label: "offline channel pid")
    {:noreply, %{state | channel_pids: new_channel_pids}}
  end

  @impl true
  def handle_info({:DOWN, _ref, :process, _pid, reason}, state) do
    IO.inspect("DOWN", label: "DOWN")
    IO.inspect(reason, label: "channel down reason")
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

    IO.inspect("-------------------------")
    IO.inspect(state, label: "state")

    if is_both_init_complete?(state) do
      IO.inspect("is_both_init_complete?", label: "is_both_init_complete 11")
      broadcast_request_employee_connection_data(state.session_id)
    end

    {:noreply, state}
  end

  @impl true
  def handle_cast(:employee_init_complete, state = %{employee: employee}) do
    employee = Map.put(employee, :init_complete, true)
    state = Map.put(state, :employee, employee)

    IO.inspect("-------------------------")
    IO.inspect(state, label: "state")

    if is_both_init_complete?(state) do
      IO.inspect("is_both_init_complete?", label: "is_both_init_complete 11")
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

    if is_both_joined?(state) do
      IO.inspect("is_both_joined?", label: "is_both_joined 11")
      broadcast_call_session_init(state.session_id)
    end

    {:noreply, state}
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

  defp broadcast_request_employee_connection_data(session_id) do
    channel_topic = "call:#{session_id}"

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(channel_topic, @br_en_request_employee_connection_data, %{})
  end
end
