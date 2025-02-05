defmodule ConsumerVoiceMvpWeb.CompanyController do
  use ConsumerVoiceMvpWeb, :controller

  alias ConsumerVoiceMvp.Companies

  action_fallback ConsumerVoiceMvpWeb.FallbackController

  def index(conn, _params) do
    companies = Companies.list_companies()
    render(conn, :index, companies: companies)
  end

  # def create(conn, %{"todo" => todo_params}) do
  #   with {:ok, %Todo{} = todo} <- Tasks.create_todo(todo_params) do
  #     conn
  #     |> put_status(:created)
  #     |> put_resp_header("location", ~p"/api/todos/#{todo}")
  #     |> render(:show, todo: todo)
  #   end
  # end

  def show(conn, %{"id" => id}) do
    company = Companies.get_company(id)
    status = Companies.get_company_status(company.id)
    company = Map.put(company, :status, status)
    IO.inspect(company)
    render(conn, :show, company: company)
  end

  # def update(conn, %{"id" => id, "todo" => todo_params}) do
  #   todo = Tasks.get_todo!(id)

  #   with {:ok, %Todo{} = todo} <- Tasks.update_todo(todo, todo_params) do
  #     render(conn, :show, todo: todo)
  #   end
  # end

  # def delete(conn, %{"id" => id}) do
  #   todo = Tasks.get_todo!(id)

  #   with {:ok, %Todo{}} <- Tasks.delete_todo(todo) do
  #     send_resp(conn, :no_content, "")
  #   end
  # end
end
