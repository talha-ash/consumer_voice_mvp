defmodule ConsumerVoiceMvp.Companies.Online_Employee do
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

  schema "online_employees" do
    field :status, Ecto.Enum, values: @status_values
    field :employee_id, :integer

    belongs_to :users, Accounts.User, foreign_key: :employee_id, define_field: false
    belongs_to :companies, Company
    timestamps(type: :utc_datetime)
  end

  @create_fields ~w(employee_id company_id)a

  def creation_changeset(online_employee, attrs) do
    online_employee
    |> cast(attrs, @create_fields)
    |> validate_required(@create_fields)
    |> unique_constraint(:employee_id)
  end

  def update_changeset(online_employee, attrs) do
    online_employee
    |> cast(attrs, [:status])
    |> validate_required([:status])
    |> validate_inclusion(:status, @status_values)
  end
end
