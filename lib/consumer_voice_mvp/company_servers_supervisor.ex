defmodule ConsumerVoiceMvp.CompanyServersSupervisor do
  use DynamicSupervisor
  alias ConsumerVoiceMvp.CompanyServer
  alias ConsumerVoiceMvp.Repo
  alias ConsumerVoiceMvp.Companies.Company

  def start_link(args) do
    DynamicSupervisor.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init(_args) do
    DynamicSupervisor.init(strategy: :one_for_one, shutdown: :infinity)
  end

  def start_companies_server do
    companies = Repo.all(Company)

    Enum.map(companies, fn company ->
      # Start a GenServer for each company
      DynamicSupervisor.start_child(__MODULE__, {CompanyServer, company})
    end)
  end
end
