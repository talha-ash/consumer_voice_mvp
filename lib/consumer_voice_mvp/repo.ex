defmodule ConsumerVoiceMvp.Repo do
  use Ecto.Repo,
    otp_app: :consumer_voice_mvp,
    adapter: Ecto.Adapters.SQLite3
end
