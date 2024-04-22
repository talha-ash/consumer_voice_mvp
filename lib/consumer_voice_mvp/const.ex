defmodule ConsumerVoiceMvp.Const do
  # Michal's snippet:
  values = [
    initialization_completed: "Initialization completed",
    client_company_topic: "client:company:",
    employee_company_topic: "employee:company:",
    employee_status_idle: :idle,
    employee_status_busy: :busy,
    employee_status_offline: :offline,
    company_status_available: :available,
    company_status_busy: :busy,
    company_status_offline: :offline,
    # en event names
    en_company_state_update: "en_company_state_update"
  ]

  for {key, value} <- values do
    def encode(unquote(key)), do: unquote(value)
    def decode(unquote(value)), do: unquote(key)
  end
end
