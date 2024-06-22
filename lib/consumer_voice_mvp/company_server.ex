defmodule ConsumerVoiceMvp.CompanyServer do
  # shutdown use to increase time to wait for the process to shutdown
  use GenServer, shutdown: 10000
  alias ConsumerVoiceMvp.Helpers
  alias ConsumerVoiceMvp.{CompanyRegistry, Const}
  alias ConsumerVoiceMvp.CompanyServerData

  # @employee_company_topic Const.encode(:employee_company_topic)
  # @client_company_topic Const.encode(:client_company_topic)

  # @br_ev_company_state_update Const.encode(:br_ev_company_state_update)
  @br_en_on_call_active Const.encode(:br_en_on_call_active)

  @client_call_initiate_decoded Const.decode("client_call_initiate")
  @client_call_initiate Const.encode(:client_call_initiate)
  @client_topic Const.encode(:client_topic)
  @client_connection_data_decoded Const.decode("client_connection_data")

  @employee_topic Const.encode(:employee_topic)
  @employee_accept_call_decoded Const.decode("employee_accept_call")

  @employee_terminate_call_decoded Const.decode("employee_terminate_call")
  @client_terminate_call_decoded Const.decode("client_terminate_call")

  @br_en_call_terminate Const.encode(:br_en_call_terminate)
  @br_client_connection_data Const.encode(:br_client_connection_data)

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
      company: Helpers.struct_to_map_terminate(company, [:__meta__, :users])
    }

    {:ok, state}
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
    case CompanyServerData.on_client_call_initiate(client.id, state.company.id) do
      {:ok, employee} ->
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

    {:ok, call} =
      CompanyServerData.employee_accept_call(
        employee_id: employee_id,
        client_id: client_id,
        company_id: state.company.id
      )

    broadcast_on_call_active(%{
      employee_id: employee_id,
      client_id: client_id,
      session_id: call.session_id
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

  # defp broadcast_state_update(state) do
  #   ConsumerVoiceMvpWeb.Endpoint.broadcast!(
  #     "#{@employee_company_topic}#{state.company.id}",
  #     @br_ev_company_state_update,
  #     state
  #   )

  #   company_state_for_client = Map.take(state, [:status, :company])

  #   ConsumerVoiceMvpWeb.Endpoint.broadcast!(
  #     "#{@client_company_topic}#{state.company.id}",
  #     @br_ev_company_state_update,
  #     company_state_for_client
  #   )
  # end

  defp broadcast_employee_for_call(employee_id, client) do
    IO.inspect(employee_id, label: "Employee ID")

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @client_call_initiate,
      %{client: client}
    )
  end

  # defp broadcast_employee_call_terminate(client_id) do
  #   ConsumerVoiceMvpWeb.Endpoint.broadcast!(
  #     "#{@client_topic}#{client_id}",
  #     @br_en_call_terminate,
  #     %{}
  #   )
  # end

  # defp broadcast_client_call_terminate(employee_id) do
  #   ConsumerVoiceMvpWeb.Endpoint.broadcast!(
  #     "#{@employee_topic}#{employee_id}",
  #     @br_en_call_terminate,
  #     %{}
  #   )
  # end

  defp broadcast_client_connection_data({connection_data, employee_id}) do
    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_client_connection_data,
      %{connection_data: connection_data}
    )
  end

  defp broadcast_on_call_active(params) do
    %{
      employee_id: employee_id,
      client_id: client_id,
      session_id: session_id
    } = params

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@employee_topic}#{employee_id}",
      @br_en_on_call_active,
      %{client_id: client_id, session_id: session_id}
    )

    ConsumerVoiceMvpWeb.Endpoint.broadcast!(
      "#{@client_topic}#{client_id}",
      @br_en_on_call_active,
      %{
        employee_id: employee_id,
        session_id: session_id
      }
    )
  end
end

# Registry.select(your_registry, [{{:"$1", :_, :_}, [], [:"$1"]}])
