defmodule ConsumerVoiceMvp.Helpers do
  def string_to_integer(string) do
    string |> String.trim() |> String.to_integer()
  end

  def struct_to_map_drop(struct, keys) do
    Map.from_struct(struct) |> Map.drop(keys)
  end
end
