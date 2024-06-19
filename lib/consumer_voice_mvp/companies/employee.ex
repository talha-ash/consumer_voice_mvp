defmodule ConsumerVoiceMvp.Companies.Employee do
  use Ecto.Schema
  import Ecto.Changeset
  alias ConsumerVoiceMvp.Const
  alias ConsumerVoiceMvp.Companies.Company
  alias ConsumerVoiceMvp.Accounts

  @status_values [
    Const.encode(:employee_status_idle),
    Const.encode(:employee_status_in_call),
    Const.encode(:employee_status_offline)
  ]

  schema "employees" do
    field :status, Ecto.Enum, values: @status_values

    belongs_to :users, Accounts.User, foreign_key: :user_id
    belongs_to :companies, Company, foreign_key: :company_id
    timestamps(type: :utc_datetime)
  end

  @create_fields ~w(user_id company_id)a

  def creation_changeset(online_employee, attrs) do
    online_employee
    |> cast(attrs, @create_fields)
    |> validate_required(@create_fields)
    |> unique_constraint(:user_id)
  end

  def update_changeset(online_employee, attrs) do
    online_employee
    |> cast(attrs, [:status])
    |> validate_required([:status])
    |> validate_inclusion(:status, @status_values)
  end
end
