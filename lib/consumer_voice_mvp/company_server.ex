defmodule ConsumerVoiceMvp.CompanyServer do
  # shutdown use to increase time to wait for the process to shutdown
  use GenServer, shutdown: 10000
  alias Phoenix.PubSub
  alias ConsumerVoiceMvp.Helpers
  alias ConsumerVoiceMvp.{CompanyRegistry, Const}
  alias ConsumerVoiceMvp.CompanyServerData

  @br_en_down_count_timeout Const.encode(:br_en_down_count_timeout)
  @br_client_connection_data Const.encode(:br_client_connection_data)

  @client_call_initiate_decoded Const.decode("client_call_initiate")
  @client_connection_data_decoded Const.decode("client_connection_data")
  @client_terminate_call_decoded Const.decode("client_terminate_call")

  @employee_company_topic Const.encode(:employee_company_topic)
  @employee_topic Const.encode(:employee_topic)
  @employee_accept_call_decoded Const.decode("employee_accept_call")
  @employee_terminate_call_decoded Const.decode("employee_terminate_call")

  @call_down_count_timeout Const.encode(:call_down_count_timeout)

  def start_link(init_arg) do
    GenServer.start_link(__MODULE__, init_arg, name: CompanyRegistry.add_company_pid(init_arg.id))
  end

  def on_employee_online(pid, employee) do
    GenServer.cast(pid, {:on_employee_online, employee})
  end

  def employee_accept_call(pid, params) do
    GenServer.cast(pid, {@employee_accept_call_decoded, params})
  end

  @impl true
  def init(company) do
    Process.flag(:trap_exit, true)

    state = %{
      status: Const.encode(:company_status_offline),
      company: Helpers.struct_to_map_drop(company, [:__meta__, :users])
    }

    {:ok, state}
  end

  @impl true
  def handle_info({:EXIT, pid, reason}, state) do
    IO.inspect("Company Server Catch Exit")
    IO.inspect({:EXIT, pid, reason}, label: "EXIT")
    IO.inspect(state, label: "State")
    {:noreply, state}
  end

  @impl true
  def handle_cast({:on_employee_online, employee}, state) do
    CompanyServerData.on_employee_online(state, employee)

    # broadcast_state_update(state)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:on_employee_offline, employee_id}, state) do
    case CompanyServerData.on_employee_offline(employee_id, state.company.id) do
      {:ok, _call} ->
        # broadcast_employee_call_terminate(call.client_id)
        # broadcast_state_update(state)
        {:noreply, state}

      {:error, message} ->
        IO.inspect(message, label: "Error on employee offline")

        # broadcast_state_update(state)
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({:on_client_online, _client}, state) do
    # state = CompanyServerData.on_client_online(state, client)

    # broadcast_state_update(state)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:on_client_offline, client_id}, state) do
    case CompanyServerData.on_client_offline(client_id, state.company.id) do
      {:ok, _call} ->
        # broadcast_state_update(state)
        # broadcast_client_call_terminate(call.employee_id)

        {:noreply, state}

      _ ->
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({@client_call_initiate_decoded, client}, state) do
    ConsumerVoiceMvp.CallRequestServer.start_link(%{
      company_id: state.company.id,
      client: client
    })

    {:noreply, state}
  end

  @impl true
  def handle_cast({@employee_terminate_call_decoded, params}, state) do
    {employee_id} = params

    case CompanyServerData.on_terminate_call({:employee, employee_id, state.company.id}) do
      {:ok, _call} ->
        # broadcast_employee_call_terminate(client_id)
        {:noreply, state}

      {:error, message} ->
        IO.inspect(message, label: "Error On Employee Drop Call")
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({@call_down_count_timeout, params}, state) do
    {session_id, employee_id} = params

    case CompanyServerData.drop_call(session_id, state.company.id) do
      {:ok, _call} ->
        PubSub.broadcast(
          ConsumerVoiceMvp.PubSub,
          "#{@employee_company_topic}#{state.company.id}",
          {:employee_terminate_call, employee_id}
        )

        broadcast_down_count_timeout(session_id)
        {:noreply, state}

      {:error, message} ->
        IO.inspect(message, label: "Error On call_down_count_timeout Drop Call")
        {:noreply, state}
    end
  end

  @impl true
  def handle_cast({@client_terminate_call_decoded, {client_id}}, state) do
    {:ok, _call} = CompanyServerData.on_terminate_call({:client, client_id, state.company.id})

    # broadcast_client_call_terminate(call.employee_id)
    {:noreply, state}
  end

  @impl true
  def handle_cast({@client_connection_data_decoded, params}, state) do
    {connection_data, _client_id, employee_id} = params
    # {state, employee_id} = CompanyServerData.on_terminate_call(state, client_id, nil)

    broadcast_client_connection_data({connection_data, employee_id})
    {:noreply, state}
  end

  @impl true
  def terminate(reason, _state) do
    IO.inspect(reason, label: "reason")
    :ok
  end

  defp broadcast_client_connection_data({connection_data, employee_id}) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_client_connection_data,
      %{connection_data: connection_data}
    )
  end

  defp broadcast_down_count_timeout(session_id) do
    channel_topic = "call:#{session_id}"

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(channel_topic, @br_en_down_count_timeout, %{})
  end
end

# Registry.select(your_registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
