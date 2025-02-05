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
    call_terminate: "call_terminate",
    call_down_count_timeout: :call_down_count_timeout,

    # call statuses
    call_status_initiated: :initiated,
    call_status_active: :active,
    call_status_ended: :ended,
    call_status_waiting: :waiting,

    # en event names
    br_ev_company_state_update: "br_ev_company_state_update",
    br_en_on_call_session_start: "br_en_on_call_session_start",
    br_en_call_terminate: "br_en_call_terminate",
    br_client_connection_data: "br_client_connection_data",
    br_en_employee_connection_data: "br_en_employee_connection_data",
    br_en_client_connection_data: "br_en_client_connection_data",
    br_en_client_call_terminate: "br_en_client_call_terminate",
    br_en_employee_call_terminate: "br_en_employee_call_terminate",
    br_en_session_init: "br_en_session_init",
    br_en_request_employee_connection_data: "br_en_request_employee_connection_data",
    br_en_entity_down: "br_en_entity_down",
    br_en_down_count: "br_en_down_count",
    br_en_down_count_timeout: "br_en_down_count_timeout",
    br_en_entity_has_call: "br_en_entity_has_call",
    br_en_client_call_request_timeout: "br_en_client_call_request_timeout",
    br_en_client_call_cancel: "br_en_client_call_cancel",

    # Client Hanle In events name
    client_call_initiate: "client_call_initiate",
    client_init_complete: "client_init_complete",
    client_terminate_call: "client_terminate_call",
    client_connection_data: "client_connection_data",
    client_reject_call_request: "client_reject_call_request",

    # Employee Hanle In events name
    employee_accept_call: "employee_accept_call",
    employee_terminate_call: "employee_terminate_call",
    employee_connection_data: "employee_connection_data",
    employee_init_complete: "employee_init_complete",
    employee_reject_call_request: "employee_reject_call_request",

    # Presences Topic
    employee_company_presence_topic: :employee_company_presence_topic,

    # Call Settings
    drop_call_wait_time: 5
  ]

  for {key, value} <- values do
    def encode(unquote(key)), do: unquote(value)
    def decode(unquote(value)), do: unquote(key)
  end
end
