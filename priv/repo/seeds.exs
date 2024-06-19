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

alias ConsumerVoiceMvp.Companies.Employee
alias ConsumerVoiceMvp.{Repo}
alias ConsumerVoiceMvp.Companies
alias ConsumerVoiceMvp.Accounts.User

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

user1 = %{"email" => "user1@voice.com", "password" => "password12345"}
user2 = %{"email" => "user2@voice.com", "password" => "password12345"}

employee1 = %{"email" => "employee1@voice.com", "password" => "password12345", "company_id" => 1, "role" => "employee"}
employee2 = %{"email" => "employee2@voice.com", "password" => "password12345", "company_id" => 1, "role" => "employee"}

user1_changeset = User.registration_changeset(%User{}, user1)
user2_changeset = User.registration_changeset(%User{}, user2)
employee1_changeset = User.registration_changeset(%User{}, employee1)
employee2_changeset = User.registration_changeset(%User{}, employee2)

Repo.insert!(user1_changeset)
Repo.insert!(user2_changeset)
emp1 = Repo.insert!(employee1_changeset)
emp2 = Repo.insert!(employee2_changeset)

online_emp1 =
  Employee.creation_changeset(%Employee{}, %{company_id: emp1.company_id, user_id: emp1.id})

online_emp2 =
  Employee.creation_changeset(%Employee{}, %{company_id: emp2.company_id, user_id: emp2.id})

Repo.insert!(online_emp1)
Repo.insert!(online_emp2)
