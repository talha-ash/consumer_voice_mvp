defmodule ConsumerVoiceMvp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      ConsumerVoiceMvpWeb.Telemetry,
      ConsumerVoiceMvp.Repo,
      # {DNSCluster, query: Application.get_env(:consumer_voice_mvp, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: ConsumerVoiceMvp.PubSub},
      ConsumerVoiceMvpWeb.Presence,
      # Start the Finch HTTP client for sending emails
      {Finch, name: ConsumerVoiceMvp.Finch},
      {Registry, keys: :unique, name: ConsumerVoiceMvp.CompanyRegistry},
      ConsumerVoiceMvp.CallSessionRegistry,
      # Start a worker by calling: ConsumerVoiceMvp.Worker.start_link(arg)
      # {ConsumerVoiceMvp.Worker, arg},
      # Start to serve requests, typically the last entry
      ConsumerVoiceMvpWeb.Endpoint,
      # start dynamic supervisor for company servers
      {DynamicSupervisor, strategy: :one_for_one, name: ConsumerVoiceMvp.CompanyServersSupervisor},
      ConsumerVoiceMvp.InitializationServer
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ConsumerVoiceMvp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ConsumerVoiceMvpWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
