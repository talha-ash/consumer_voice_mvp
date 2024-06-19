defmodule ConsumerVoiceMvp.Const do
  values = [
    initialization_completed: "Initialization completed",
    client_company_topic: "client:company:",
    employee_company_topic: "employee:company:",
    employee_topic: "employee:",
    client_topic: "client:",
    employee_status_idle: :idle,
    employee_status_busy: :busy,
    employee_status_in_call: :in_call,
    employee_status_offline: :offline,
    company_status_available: :available,
    company_status_busy: :busy,
    company_status_offline: :offline,
    call_drop: "call_drop",

    # call statuses
    call_status_initiated: :initiated,
    call_status_active: :active,
    call_status_ended: :ended,
    call_status_waiting: :waiting,

    # en event names
    br_ev_company_state_update: "br_ev_company_state_update",
    br_en_on_call_active: "br_en_on_call_active",
    br_en_call_drop: "br_en_call_drop",
    br_client_connection_data: "br_client_connection_data",
    br_en_employee_connection_data: "br_en_employee_connection_data",
    br_en_client_connection_data: "br_en_client_connection_data",

    # Client Hanle In events name
    client_call_initiate: "client_call_initiate",
    client_drop_call: "client_drop_call",
    client_connection_data: "client_connection_data",

    # Employee Hanle In events name
    employee_accept_call: "employee_accept_call",
    employee_drop_call: "employee_drop_call",
    employee_connection_data: "employee_connection_data"
  ]

  for {key, value} <- values do
    def encode(unquote(key)), do: unquote(value)
    def decode(unquote(value)), do: unquote(key)
  end
end
