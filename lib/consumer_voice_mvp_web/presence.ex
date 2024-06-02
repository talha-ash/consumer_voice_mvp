defmodule ConsumerVoiceMvpWeb.Presence do
  use Phoenix.Presence,
    otp_app: :consumer_voice_mvp,
    pubsub_server: ConsumerVoiceMvp.PubSub
end
