defmodule ConsumerVoiceMvp.CallSessionRegistry do
  def start_link do
    Registry.start_link(keys: :unique, name: __MODULE__)
  end

  def via_tuple(session_id) do
    {:via, Registry, {__MODULE__, session_id}}
  end

  def child_spec(_) do
    Supervisor.child_spec(
      Registry,
      id: __MODULE__,
      start: {__MODULE__, :start_link, []}
    )
  end

  def call_session_pid_lookup(session_id) do
    case Registry.lookup(__MODULE__, "#{session_id}") do
      [{pid, _value}] ->
        {:ok, pid}

      _ ->
        nil
    end
  end
end
