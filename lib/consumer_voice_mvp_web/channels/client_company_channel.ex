defmodule ConsumerVoiceMvpWeb.ClientCompanyChannel do
  alias ConsumerVoiceMvp.{Const, Helpers, CompanyRegistry}
  use Phoenix.Channel

  @client_company_topic Const.encode(:client_company_topic)
  @client_call_initiate Const.encode(:client_call_initiate)
  @client_reject_call_request Const.encode(:client_reject_call_request)
  @br_ev_company_state_update Const.encode(:br_ev_company_state_update)
  @company_status_available Const.encode(:company_status_available)
  @company_status_busy Const.encode(:company_status_busy)
  @company_status_offline Const.encode(:company_status_offline)

  @impl true
  def join(@client_company_topic <> company_id, params, socket) do
    client_id = params["clientId"]
    company_id = Helpers.string_to_integer(company_id)

    client =
      ConsumerVoiceMvp.Accounts.get_user!(client_id)
      |> Helpers.struct_to_map_drop([:__meta__, :company])

    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(server_pid, {:on_client_online, client})

    ConsumerVoiceMvpWeb.Presence.subscribe_company_employee_presence(company_id)

    socket =
      socket
      |> assign(:client, client)
      |> assign(:company_id, company_id)
      |> assign(:server_pid, server_pid)

    {:ok, socket}
  end

  @impl true
  def handle_in(@client_call_initiate, _payload, socket) do
    client = socket.assigns.client
    server_pid = socket.assigns.server_pid

    GenServer.cast(server_pid, {Const.decode(@client_call_initiate), client})

    {:noreply, socket}
  end

  @impl true
  def handle_in(@client_reject_call_request, _payload, socket) do
    client = socket.assigns.client

    {:ok, client_request_pid} = CompanyRegistry.call_request_pid_lookup(client.id)
    GenServer.cast(client_request_pid, {@client_reject_call_request})

    {:noreply, socket}
  end

  @impl true
  def handle_info(%{event: "presence_diff", payload: payload}, socket) do
    %{joins: joins} = payload
    broadcast_presence_changes(socket, joins)
    {:noreply, socket}
  end

  # @impl true
  # def handle_info({:employee_precense_update, payload}, socket) do
  #   %{joins: joins} = payload
  #   IO.inspect(joins, label: "Presence Diff")
  #   broadcast_presence_changes(socket, joins)
  #   {:noreply, socket}
  # end

  @impl true
  def terminate(reason, _socket) do
    IO.inspect("Client Goes Dequeue", label: "reason")
    IO.inspect(reason)
  end

  def broadcast_presence_changes(socket, presence_list) when map_size(presence_list) == 0 do
    company_id = socket.assigns.company_id

    broadcast(socket, @br_ev_company_state_update, %{
      status: @company_status_offline,
      company_id: company_id
    })
  end

  def broadcast_presence_changes(socket, presence_list) do
    company_id = socket.assigns.company_id

    broadcast(socket, @br_ev_company_state_update, %{
      status: company_status(presence_list),
      company_id: company_id
    })
  end

  defp company_status(presence_list) do
    result =
      Enum.reduce(presence_list, [0, 0], fn {_k, v}, acc ->
        v.metas
        |> Enum.reduce(acc, fn x, acc ->
          case x.status do
            :idle -> List.replace_at(acc, 0, 1)
            :busy -> List.replace_at(acc, 1, 1)
            _ -> acc
          end
        end)
      end)

    case result do
      [1, _] -> @company_status_available
      [0, 1] -> @company_status_busy
      _ -> @company_status_offline
    end
  end
end
