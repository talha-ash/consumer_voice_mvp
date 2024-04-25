defmodule ConsumerVoiceMvpWeb.ClientCompanyChannel do
  alias ConsumerVoiceMvp.{Const, Helpers, CompanyRegistry}
  use Phoenix.Channel

  @client_company_topic Const.encode(:client_company_topic)
  @client_call_initiate Const.encode(:client_call_initiate)

  @impl true
  def join(@client_company_topic <> company_id, params, socket) do
    client_id = params["clientId"]
    company_id = Helpers.string_to_integer(company_id)

    client =
      ConsumerVoiceMvp.Accounts.get_user!(client_id)
      |> Helpers.struct_to_map_drop([:__meta__, :company])

    {:ok, server_pid} = CompanyRegistry.company_pid_lookup(company_id)

    GenServer.cast(server_pid, {:on_client_online, client})

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
  def terminate(reason, socket) do
    client = socket.assigns.client
    server_pid = socket.assigns.server_pid

    GenServer.cast(
      server_pid,
      {:on_client_offline, client.id}
    )

    IO.inspect("Client Goes Dequeue", label: "reason")
    IO.inspect(reason)
  end
end
