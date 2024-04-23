defmodule ConsumerVoiceMvp.CompanyServer do
  # shutdown use to increase time to wait for the process to shutdown
  use GenServer, shutdown: 10000
  alias ConsumerVoiceMvp.Helpers
  alias ConsumerVoiceMvp.{CompanyRegistry, Const}
  alias ConsumerVoiceMvp.CompanyServerData

  @employee_company_topic Const.encode(:employee_company_topic)
  @client_company_topic Const.encode(:client_company_topic)
  @en_company_state_update Const.encode(:en_company_state_update)

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg, name: CompanyRegistry.add_company_pid(init_arg.id))
  end

  @impl true
  def init(company) do
    Process.flag(:trap_exit, true)

    state = %{
      status: Const.encode(:company_status_offline),
      idle_employees: 0,
      client_queue: [],
      online_employees_list: [],
      company: Helpers.struct_to_map_drop(company, [:__meta__, :users])
    }

    {:ok, state}
  end

  @impl true
  def handle_cast({:on_employee_online, employee}, state) do
    state = CompanyServerData.on_employee_online(state, employee)

    broadcast_state_update(state)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:on_employee_offline, employee_id}, state) do
    state = CompanyServerData.on_employee_offline(state, employee_id)

    broadcast_state_update(state)

    {:noreply, state}
  end

  @impl true
  def terminate(reason, _state) do
    IO.inspect(reason, label: "reason")
    :ok
  end

  defp broadcast_state_update(state) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_company_topic}#{state.company.id}",
      @en_company_state_update,
      state
    )

    company_state_for_client = Map.take(state, [:status, :client_queue, :company])

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_company_topic}#{state.company.id}",
      @en_company_state_update,
      company_state_for_client
    )
  end
end

# Registry.select(your_registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
