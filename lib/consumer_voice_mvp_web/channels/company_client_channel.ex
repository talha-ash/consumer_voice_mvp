defmodule ConsumerVoiceMvpWeb.ClientCompanyChannel do
  alias ConsumerVoiceMvp.Const
  use Phoenix.Channel

  @client_company_topic Const.encode(:client_company_topic)
  def join(@client_company_topic <> client_id, _params, socket) do
    IO.inspect(client_id, label: "client_id")
    {:ok, socket}
  end
end
