defmodule Mix.Tasks.AssetsBuild do
  @moduledoc "Printed when the user requests `mix help echo`"
  @shortdoc "Echoes arguments"

  use Mix.Task

  @impl Mix.Task
  def run(_args) do
    Mix.shell().cmd("cd assets && node build.js --deploy && cd ../")
    Mix.shell().cmd("mix phx.digest")
  end
end
