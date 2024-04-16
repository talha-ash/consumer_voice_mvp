defmodule ConsumerVoiceMvp.Repo.Migrations.CreateTodos do
  use Ecto.Migration

  def change do
    create table(:todos) do
      add :title, :string

      timestamps(type: :utc_datetime)
    end
  end
end
