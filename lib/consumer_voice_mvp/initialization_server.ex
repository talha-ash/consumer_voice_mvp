defmodule ConsumerVoiceMvp.InitializationServer do
  # we transient the child process is restarted only if it terminates
  # abnormally, i.e., with an exit reason other than :normal , :shutdown
  use GenServer, restart: :transient
  alias ConsumerVoiceMvp.Const

  def start_link(arg) do
    GenServer.start_link(__MODULE__, arg)
  end

  @impl true
  def init(arg) do
    {:ok, arg, {:continue, :initialization}}
  end

  @impl true
  def handle_continue(:initialization, state) do
    initialization()

    GenServer.cast(self(), {:show_message, Const.encode(:initialization_completed)})
    {:noreply, state}
  end

  @impl true
  def handle_cast({:show_message, message}, state) do
    IO.inspect(message)
    {:stop, :normal, state}
  end

  defp initialization do
    Task.start_link(fn ->
      ConsumerVoiceMvp.CompanyServersSupervisor.start_companies_server()
    end)
  end
end
