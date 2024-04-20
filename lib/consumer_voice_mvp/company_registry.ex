defmodule ConsumerVoiceMvp.CompanyRegistry do
  def add_company_pid(id) do
    name = "#{__MODULE__}#{inspect(id)}"
    {:via, Registry, {ConsumerVoiceMvp.CompanyRegistry, name}}
  end

  def company_pid_lookup(id) do
    case Registry.lookup(__MODULE__, "#{__MODULE__}#{id}") do
      [{pid, _value}] ->
        {:ok, pid}

      _ ->
        nil
    end
  end
end
