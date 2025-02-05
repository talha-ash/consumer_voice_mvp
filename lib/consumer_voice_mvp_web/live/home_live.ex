defmodule ConsumerVoiceMvpWeb.HomeLive do
  alias ConsumerVoiceMvp.Companies
  use ConsumerVoiceMvpWeb, :live_view

  def render(assigns) do
    ~H"""
    <div id="user-info" data-user-info={@encoded_current_user}></div>
    """
  end

  def mount(%{"token" => _token}, _session, socket) do
    current_user = socket.assigns.current_user |> Map.from_struct()

    if(current_user.role == :employee) do
      employee =
        Companies.get_employee_by_user(current_user.id, current_user.company_id)

      {:ok, current_user} =
        %{
          id: employee.id,
          role: current_user.role,
          email: current_user.email,
          status: employee.status,
          confirmed_at: current_user.confirmed_at,
          companyId: current_user.company_id,
          # company: json_encode_company(current_user),
          inserted_at: employee.inserted_at,
          updated_at: employee.updated_at
        }
        |> Jason.encode()

      socket = assign(socket, :encoded_current_user, current_user)
      {:ok, socket}
    else
      socket = assign(socket, :encoded_current_user, json_encode_user(current_user))
      {:ok, socket}
    end
  end

  def mount(_params, _session, socket) do
    current_user = socket.assigns.current_user |> Map.from_struct()

    if(current_user.role == :employee) do
      employee =
        Companies.get_employee_by_user(current_user.id, current_user.company_id)

      {:ok, current_user} =
        %{
          id: employee.id,
          role: current_user.role,
          email: current_user.email,
          status: employee.status,
          confirmed_at: current_user.confirmed_at,
          companyId: current_user.company_id,
          # company: json_encode_company(current_user),
          inserted_at: employee.inserted_at,
          updated_at: employee.updated_at
        }
        |> Jason.encode()

      socket = assign(socket, :encoded_current_user, current_user)
      {:ok, socket, layout: {ConsumerVoiceMvpWeb.Layouts, :auth_app}}
    else
      socket = assign(socket, :encoded_current_user, json_encode_user(current_user))
      {:ok, socket, layout: {ConsumerVoiceMvpWeb.Layouts, :auth_app}}
    end
  end

  defp json_encode_user(user) do
    {:ok, user} =
      user
      |> json_encode_company()
      |> Map.drop([:__meta__, :password, :hashed_password])
      |> Jason.encode()

    user
  end

  defp json_encode_company(user) do
    cond do
      user.company != nil ->
        company =
          user.company
          |> Map.from_struct()
          |> Map.drop([:__meta__, :users])

        Map.put(user, :company, company)

      true ->
        user
    end
  end
end
