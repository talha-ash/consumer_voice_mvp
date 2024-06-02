defmodule ConsumerVoiceMvp.Repo.Migrations.AddCompaniesTable do
  use Ecto.Migration

  def change do
    create table(:companies) do
      add :name, :string, null: false
      add :status, :boolean, null: false, default: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:companies, [:name])
  end
end
