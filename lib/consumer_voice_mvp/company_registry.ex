defmodule ConsumerVoiceMvp.CompanyRegistry do
  def add_company_pid(id) do
    name = "#{__MODULE__}#{inspect(id)}"

    {:via, Registry, {__MODULE__, name}}
  end

  def company_pid_lookup(id) do
    case Registry.lookup(__MODULE__, "#{__MODULE__}#{id}") do
      [{pid, _value}] ->
        {:ok, pid}

      _ ->
        nil
    end
  end

  def add_call_request_pid(client_id) do
    name = "#{__MODULE__}_call_request_#{inspect(client_id)}"
    {:via, Registry, {__MODULE__, name}}
  end

  def call_request_pid_lookup(client_id) do
    case Registry.lookup(__MODULE__, "#{__MODULE__}_call_request_#{client_id}") do
      [{pid, _value}] ->
        {:ok, pid}

      _ ->
        nil
    end
  end
end
