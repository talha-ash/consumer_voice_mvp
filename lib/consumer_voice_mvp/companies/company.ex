defmodule ConsumerVoiceMvp.Companies.Company do
  use Ecto.Schema
  import Ecto.Changeset
  alias ConsumerVoiceMvp.{Accounts, Repo}
  @derive {Jason.Encoder, only: [:id, :name]}
  schema "companies" do
    field :name, :string

    has_many :users, Accounts.User
    timestamps(type: :utc_datetime)
  end

  @field :name

  def changeset(company, attrs) do
    company
    |> cast(attrs, [@field])
    |> validate_required([@field])
    |> validate_length(@field, min: 160, max: 400)
    |> unsafe_validate_unique(@field, Repo)
    |> unique_constraint(@field)
  end
end
