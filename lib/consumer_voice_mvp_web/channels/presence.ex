defmodule ConsumerVoiceMvpWeb.Presence do
  @moduledoc """
  Provides presence tracking to channels and processes.

  See the [`Phoenix.Presence`](https://hexdocs.pm/phoenix/Phoenix.Presence.html)
  docs for more details.
  """
  alias ConsumerVoiceMvp.Const

  use Phoenix.Presence,
    otp_app: :consumer_voice_mvp,
    pubsub_server: ConsumerVoiceMvp.PubSub

  # @employee_company_topic Const.encode(:employee_company_topic)

  # def subscribe_employee_presence(company_id) do
  #   Phoenix.PubSub.subscribe(
  #     ConsumerVoiceMvp.PubSub,
  #     "#{@employee_company_topic}#{company_id}"
  #   )
  # end
end
