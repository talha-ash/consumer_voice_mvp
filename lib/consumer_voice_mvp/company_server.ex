defmodule ConsumerVoiceMvp.CompanyServer do
  # shutdown use to increase time to wait for the process to shutdown
  use GenServer, shutdown: 10000
  alias ConsumerVoiceMvp.Helpers
  alias ConsumerVoiceMvp.{CompanyRegistry, Const}
  alias ConsumerVoiceMvp.CompanyServerData

  @employee_company_topic Const.encode(:employee_company_topic)
  @client_company_topic Const.encode(:client_company_topic)

  @br_ev_company_state_update Const.encode(:br_ev_company_state_update)
  @br_en_on_call_active Const.encode(:br_en_on_call_active)

  @client_call_initiate_decoded Const.decode("client_call_initiate")
  @client_call_initiate Const.encode(:client_call_initiate)
  @client_topic Const.encode(:client_topic)

  @employee_topic Const.encode(:employee_topic)
  @employee_accept_call_decoded Const.decode("employee_accept_call")

  @employee_drop_call_decoded Const.decode("employee_drop_call")
  @client_drop_call_decoded Const.decode("client_drop_call")

  @br_en_call_drop Const.encode(:br_en_call_drop)

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
      company: Helpers.struct_to_map_drop(company, [:__meta__, :users]),
      active_calls: %{}
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
    case CompanyServerData.on_employee_offline(state, employee_id) do
      {:call_unfound, state} ->
        broadcast_state_update(state)
        {:noreply, state}

      {:call_found, state, call} ->
        broadcast_employee_call_drop(call.client_id)
        broadcast_state_update(state)
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({:on_client_online, client}, state) do
    state = CompanyServerData.on_client_online(state, client)

    broadcast_state_update(state)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:on_client_offline, client_id}, state) do
    case CompanyServerData.on_client_offline(state, client_id) do
      {:call_unfound, state} ->
        broadcast_state_update(state)
        {:noreply, state}

      {:call_found, state, call} ->
        broadcast_client_call_drop(call.employee_id)
        broadcast_state_update(state)
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({@client_call_initiate_decoded, client}, state) do
    case CompanyServerData.on_client_call_initiate(state, client.id) do
      {:ok, state, employee} ->
        broadcast_employee_for_call(employee.id, client)
        {:noreply, state}

      {:error, reason} ->
        IO.inspect(reason, label: "reason")
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({@employee_accept_call_decoded, params}, state) do
    {employee_id, client_id} = params

    state = CompanyServerData.employee_accept_call(state, client_id, employee_id)

    broadcast_on_call_active(params)
    {:noreply, state}
  end

  @impl true
  def handle_cast({@employee_drop_call_decoded, params}, state) do
    IO.inspect("handle_cast employee_drop_call_decoded")
    {employee_id, client_id} = params

    state = CompanyServerData.on_drop_call(state, client_id, employee_id)

    broadcast_employee_call_drop(client_id)
    {:noreply, state}
  end

  @impl true
  def handle_cast({@client_drop_call_decoded, {nil, client_id}}, state) do
    {state, employee_id} = CompanyServerData.on_drop_call(state, client_id, nil)

    broadcast_client_call_drop(employee_id)
    {:noreply, state}
  end

  @impl true
  def handle_cast({@client_drop_call_decoded, {employee_id, client_id}}, state) do
    state = CompanyServerData.on_drop_call(state, client_id, employee_id)

    broadcast_client_call_drop(employee_id)
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
      @br_ev_company_state_update,
      state
    )

    company_state_for_client = Map.take(state, [:status, :client_queue, :company])

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_company_topic}#{state.company.id}",
      @br_ev_company_state_update,
      company_state_for_client
    )
  end

  defp broadcast_employee_for_call(employee_id, client) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @client_call_initiate,
      %{client: client}
    )
  end

  defp broadcast_employee_call_drop(client_id) do
    IO.inspect("broadcast_employee_call_drop")

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_topic}#{client_id}",
      @br_en_call_drop,
      %{}
    )
  end

  defp broadcast_client_call_drop(employee_id) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_en_call_drop,
      %{}
    )
  end

  defp broadcast_on_call_active({employee_id, client_id}) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_en_on_call_active,
      %{client_id: client_id}
    )

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_topic}#{client_id}",
      @br_en_on_call_active,
      %{employee_id: employee_id}
    )
  end
end

# Registry.select(your_registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
