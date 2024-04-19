defmodule ConsumerVoiceMvpWeb.HomeLive do
  alias ConsumerVoiceMvp.Accounts
  use ConsumerVoiceMvpWeb, :live_view

  def render(assigns) do
    ~H"""
    <div id="user-info" data-user-info={@encoded_current_user}></div>
    """
  end

  def mount(%{"token" => token}, _session, socket) do
    encoded_current_user = json_encode_user(socket.assigns.current_user)
    socket = assign(socket, :encoded_current_user, encoded_current_user)

    {:ok, socket}
  end

  def mount(_params, _session, socket) do
    encoded_current_user = json_encode_user(socket.assigns.current_user)

    socket = assign(socket, :encoded_current_user, encoded_current_user)
    {:ok, socket, layout: {ConsumerVoiceMvpWeb.Layouts, :auth_app}}
  end

  defp json_encode_user(user) do
    {:ok, user} =
      user
      |> json_encode_company()
      |> Map.from_struct()
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
