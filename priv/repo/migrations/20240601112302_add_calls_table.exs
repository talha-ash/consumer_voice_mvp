defmodule ConsumerVoiceMvp.Repo.Migrations.AddActiveCallsTable do
  use Ecto.Migration

  def change do
    create table(:calls) do
      add :employee_id, references(:employees)
      add :client_id, references(:users)
      add :company_id, references(:companies, on_delete: :delete_all)
      add :status, :string, null: false, default: "initiated"
      add :session_id, :string, null: false
      add :deleted_at, :utc_datetime

      timestamps(type: :utc_datetime)
    end

    create unique_index(:calls, [:session_id])
    create index(:calls, [:deleted_at, :company_id])
  end
end
