defmodule ConsumerVoiceMvp.CompanyServersSupervisor do
  use DynamicSupervisor
  alias ConsumerVoiceMvp.CompanyServer
  alias ConsumerVoiceMvp.Repo
  alias ConsumerVoiceMvp.Companies.Company
  alias ConsumerVoiceMvp.Companies.Employee
  alias ConsumerVoiceMvp.Companies
  alias ConsumerVoiceMvp.Accounts.User

  def start_link(args) do
    DynamicSupervisor.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init(_args) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def start_companies_server do
    if Mix.env() == :prod do
      temp_seed()
    end

    companies = Repo.all(Company)

    Enum.map(companies, fn company ->
      # Start a GenServer for each company
      DynamicSupervisor.start_child(__MODULE__, {CompanyServer, company})
    end)
  end

  defp temp_seed do
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
    Repo.delete_all(Employee)
    Repo.delete_all(User)

    Repo.insert_all(
      Companies.Company,
      companies
    )

    companies = Repo.all(Companies.Company)
    first_company = companies |> hd()
    secondCompany = Enum.at(companies, 1)

    user1 = %{"email" => "user1@voice.com", "password" => "password12345"}
    user2 = %{"email" => "user2@voice.com", "password" => "password12345"}
    user3 = %{"email" => "user3@voice.com", "password" => "password12345"}
    user4 = %{"email" => "user4@voice.com", "password" => "password12345"}
    user5 = %{"email" => "user5@voice.com", "password" => "password12345"}

    employee1 = %{
      "email" => "employee1@voice.com",
      "password" => "password12345",
      "company_id" => first_company.id,
      "role" => "employee"
    }

    employee2 = %{
      "email" => "employee2@voice.com",
      "password" => "password12345",
      "company_id" => secondCompany.id,
      "role" => "employee"
    }

    employee3 = %{
      "email" => "employee3@voice.com",
      "password" => "password12345",
      "company_id" => first_company.id,
      "role" => "employee"
    }

    employee4 = %{
      "email" => "employee4@voice.com",
      "password" => "password12345",
      "company_id" => secondCompany.id,
      "role" => "employee"
    }

    employee5 = %{
      "email" => "employee5@voice.com",
      "password" => "password12345",
      "company_id" => first_company.id,
      "role" => "employee"
    }

    employee6 = %{
      "email" => "employee6@voice.com",
      "password" => "password12345",
      "company_id" => secondCompany.id,
      "role" => "employee"
    }

    user1_changeset = User.registration_changeset(%User{}, user1)
    user2_changeset = User.registration_changeset(%User{}, user2)
    user3_changeset = User.registration_changeset(%User{}, user3)
    user4_changeset = User.registration_changeset(%User{}, user4)
    user5_changeset = User.registration_changeset(%User{}, user5)

    employee1_changeset = User.registration_changeset(%User{}, employee1)
    employee2_changeset = User.registration_changeset(%User{}, employee2)
    employee3_changeset = User.registration_changeset(%User{}, employee3)
    employee4_changeset = User.registration_changeset(%User{}, employee4)
    employee5_changeset = User.registration_changeset(%User{}, employee5)
    employee6_changeset = User.registration_changeset(%User{}, employee6)

    Repo.insert!(user1_changeset)
    Repo.insert!(user2_changeset)
    Repo.insert!(user3_changeset)
    Repo.insert!(user4_changeset)
    Repo.insert!(user5_changeset)
    emp1 = Repo.insert!(employee1_changeset)
    emp2 = Repo.insert!(employee2_changeset)
    emp3 = Repo.insert!(employee3_changeset)
    emp4 = Repo.insert!(employee4_changeset)
    emp5 = Repo.insert!(employee5_changeset)
    emp6 = Repo.insert!(employee6_changeset)

    online_emp1 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp1.company_id, user_id: emp1.id})

    online_emp2 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp2.company_id, user_id: emp2.id})

    online_emp3 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp3.company_id, user_id: emp3.id})

    online_emp4 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp4.company_id, user_id: emp4.id})

    online_emp5 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp5.company_id, user_id: emp5.id})

    online_emp6 =
      Employee.creation_changeset(%Employee{}, %{company_id: emp6.company_id, user_id: emp6.id})

    Repo.insert!(online_emp1)
    Repo.insert!(online_emp2)
    Repo.insert!(online_emp3)
    Repo.insert!(online_emp4)
    Repo.insert!(online_emp5)
    Repo.insert!(online_emp6)
  end
end
