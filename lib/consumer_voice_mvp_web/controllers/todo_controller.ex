defmodule ConsumerVoiceMvpWeb.TodoController do
  use ConsumerVoiceMvpWeb, :controller

  alias ConsumerVoiceMvp.Tasks
  alias ConsumerVoiceMvp.Tasks.Todo

  action_fallback ConsumerVoiceMvpWeb.FallbackController

  def index(conn, params) do
    todos = Tasks.list_todos()
    render(conn, :index, todos: todos)
  end

  def create(conn, %{"todo" => todo_params}) do
    with {:ok, %Todo{} = todo} <- Tasks.create_todo(todo_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/todos/#{todo}")
      |> render(:show, todo: todo)
    end
  end

  def show(conn, %{"id" => id}) do
    todo = Tasks.get_todo!(id)
    render(conn, :show, todo: todo)
  end

  def update(conn, %{"id" => id, "todo" => todo_params}) do
    todo = Tasks.get_todo!(id)

    with {:ok, %Todo{} = todo} <- Tasks.update_todo(todo, todo_params) do
      render(conn, :show, todo: todo)
    end
  end

  def delete(conn, %{"id" => id}) do
    todo = Tasks.get_todo!(id)

    with {:ok, %Todo{}} <- Tasks.delete_todo(todo) do
      send_resp(conn, :no_content, "")
    end
  end
end
