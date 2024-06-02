defmodule ConsumerVoiceMvp.Repo.Migrations.AddOnlineEmployeeTable do
  use Ecto.Migration

  def change do
    create table(:online_employees) do
      add :employee_id, references(:users)
      add :company_id, references(:companies, on_delete: :delete_all)
      add :status, :string, null: false, default: "offline"

      timestamps(type: :utc_datetime)
    end

    create unique_index(:online_employees, [:employee_id])
    create index(:online_employees, [:company_id])
  end
end
