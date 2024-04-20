defmodule ConsumerVoiceMvp.CompanyServer do
  # shutdown use to increase time to wait for the process to shutdown
  use GenServer, shutdown: 10000
  alias ConsumerVoiceMvp.CompanyRegistry

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg, name: CompanyRegistry.add_company_pid(init_arg.id))
  end

  @impl true
  def init(company) do
    IO.inspect(company, label: "company server")
    Process.flag(:trap_exit, true)
    {:ok, %{company: company}}
  end

  @impl true
  def handle_cast({:show_message, message}, state) do
    IO.inspect(message, label: "message")
    {:noreply, state}
  end

  @impl true
  def terminate(reason, state) do
    IO.inspect(reason, label: "reason")
    :ok
  end
end

# Registry.select(your_registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
