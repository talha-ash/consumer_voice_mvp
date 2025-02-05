defmodule ConsumerVoiceMvp.Calls.Call do
  use Ecto.Schema
  import Ecto.Changeset

  alias ConsumerVoiceMvp.{Const, Accounts, Companies}

  @status_values [
    Const.encode(:call_status_initiated),
    Const.encode(:call_status_active),
    Const.encode(:call_status_ended),
    Const.encode(:call_status_waiting)
  ]

  schema "calls" do
    field :status, Ecto.Enum, values: @status_values
    field :deleted_at, :utc_datetime
    field :session_id, :string

    belongs_to :employee, Accounts.User, foreign_key: :employee_id
    belongs_to :client, Accounts.User, foreign_key: :client_id
    belongs_to :company, Companies.Company

    timestamps(type: :utc_datetime)
  end

  @creation_fields ~w(employee_id client_id company_id session_id status)a

  def creation_changeset(call, attrs) do
    call
    |> cast(attrs, @creation_fields)
    |> validate_required(@creation_fields)
    |> foreign_key_constraint(:employee_id)
    |> foreign_key_constraint(:client_id)
    |> foreign_key_constraint(:company_id)
    |> validate_inclusion(:status, @status_values)
    |> unique_constraint([:session_id])
  end

  def update_changeset(call, attrs) do
    call
    |> cast(attrs, [:status])
    |> validate_required([:status])
    |> validate_inclusion(:status, @status_values)
  end
end
