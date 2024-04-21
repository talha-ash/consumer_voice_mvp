defmodule ConsumerVoiceMvp.Helpers do
  def string_to_integer(string) do
    string |> String.trim() |> String.to_integer()
  end
end
