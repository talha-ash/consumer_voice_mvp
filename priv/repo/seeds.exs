# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     ConsumerVoiceMvp.Repo.insert!(%ConsumerVoiceMvp.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

alias ConsumerVoiceMvp.{Repo}
alias ConsumerVoiceMvp.Companies

# Create a Companies
companies = [
  %{
    name: "Company 1",
    inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
    updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
  },
  %{
    name: "Company 2",
    inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
    updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
  },
  %{
    name: "Company 3",
    inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
    updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
  },
  %{
    name: "Company 4",
    inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
    updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
  },
  %{
    name: "Company 5",
    inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
    updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
  }
]

Repo.delete_all(Companies.Company)

Repo.insert_all(
  Companies.Company,
  companies
)
