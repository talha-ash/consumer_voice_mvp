defmodule ConsumerVoiceMvp.CallSessionServer do
  use GenServer
  alias ConsumerVoiceMvp.CallSessionRegistry

  def start_link(session_id) do
    IO.inspect("How many time call If there is race condition", label: "CallSessionServer")
    GenServer.start_link(__MODULE__, [], name: CallSessionRegistry.via_tuple(session_id))
  end

  @impl true
  def init(_) do
    # trap_exit to trap non-kill error messages coming from the channel PIDs
    # Process.flag(:trap_exit, true)

    :timer.send_interval(10_000, self(), :timer_count)
    send(self(), :timer_count)
    {:ok, %{channel_pids: %{}}}
  end

  # Call this when a channel connects
  def track_channel(pid, socket = %Phoenix.Socket{}) do
    GenServer.cast(pid, {:track, socket})
  end

  def state(pid) do
    GenServer.call(pid, :state)
  end

  ## Callbacks
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
  def handle_info({:DOWN, _ref, :process, pid, reason}, state) do
    IO.inspect("DOWN", label: "DOWN")
    IO.inspect(reason, label: "channel down reason")
    {:noreply, state}
  end

  @impl true
  def handle_cast(:connected_channel_count, state = %{channel_pids: pids}) do
    {:noreply, state}
  end

  @impl true
  def handle_cast(
        {:track, _socket = %Phoenix.Socket{channel_pid: pid, topic: topic}},
        state = %{channel_pids: pids}
      ) do
    link_processes_to_capture_bidirectional_exits(pid)

    new_channel_pids =
      Map.put(pids, pid, %{
        channel: topic
      })

    {:noreply, %{state | channel_pids: new_channel_pids}}
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

  defp link_processes_to_capture_bidirectional_exits(pid), do: Process.monitor(pid)
end
