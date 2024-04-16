defmodule ConsumerVoiceMvp.TasksFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `ConsumerVoiceMvp.Tasks` context.
  """

  @doc """
  Generate a todo.
  """
  def todo_fixture(attrs \\ %{}) do
    {:ok, todo} =
      attrs
      |> Enum.into(%{
        title: "some title"
      })
      |> ConsumerVoiceMvp.Tasks.create_todo()

    todo
  end
end
