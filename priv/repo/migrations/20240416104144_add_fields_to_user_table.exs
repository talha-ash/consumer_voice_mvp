defmodule ConsumerVoiceMvp.Repo.Migrations.AddFieldsToUserTable do
  use Ecto.Migration

  def change do
    create_role__query = "CREATE TYPE user_role AS ENUM ('employee', 'client', 'admin')"
    drop_query = "DROP TYPE user_role"

    partial_constraint_employee_role_query =
      "ALTER TABLE users ADD CONSTRAINT employees_must_have_company
      CHECK (role <> 'employee' OR company_id IS NOT NULL);"

    execute(create_role__query, drop_query)

    alter table(:users) do
      add :role, :user_role, default: "client", null: false
      add :company_id, references(:companies, on_delete: :delete_all), null: true
    end

    execute(partial_constraint_employee_role_query)
    create index(:users, [:role])
    create index(:users, [:company_id])
  end
end
