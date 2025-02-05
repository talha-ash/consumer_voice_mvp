defmodule ConsumerVoiceMvp.Sqids do
  import Sqids.Hacks, only: [dialyzed_ctx: 1]
  @context Sqids.new!()

  def encode!(numbers), do: Sqids.encode!(dialyzed_ctx(@context), numbers)
  def decode!(id), do: Sqids.decode!(dialyzed_ctx(@context), id)

  def encode_for_session_id!(
        employee_id: employee_id,
        client_id: client_id,
        company_id: company_id
      ) do
    timestamp = DateTime.to_unix(DateTime.utc_now(), :millisecond)
    encode!([employee_id, client_id, company_id, timestamp])
  end

  def decode_for_session_id!(id) do
    [employee_id, client_id, company_id, _] = decode!(id)
    %{employee_id: employee_id, client_id: client_id, company_id: company_id}
  end
end
