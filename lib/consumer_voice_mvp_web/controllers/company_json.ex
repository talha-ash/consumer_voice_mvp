defmodule ConsumerVoiceMvpWeb.CompanyJSON do
  alias ConsumerVoiceMvp.Companies.Company

  @doc """
  Renders a list of companies.
  """
  def index(%{companies: companies}) do
    %{data: for(company <- companies, do: data(company))}
  end

  @doc """
  Renders a single company.
  """
  def show(%{company: company}) do
    company = company |> data |> Map.put(:status, company.status)
    %{data: company}
  end

  defp data(%Company{} = company) do
    %{
      id: company.id,
      name: company.name
    }
  end
end
