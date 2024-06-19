defmodule ConsumerVoiceMvp.Repo.Migrations.AddOnlineEmployeeTable do
  use Ecto.Migration

  def change do
    create table(:employees) do
      add :user_id, references(:users)
      add :company_id, references(:companies, on_delete: :delete_all)
      add :status, :string, null: false, default: "offline"

      timestamps(type: :utc_datetime)
    end

    create unique_index(:employees, [:user_id])
    create index(:employees, [:company_id])
  end
end
