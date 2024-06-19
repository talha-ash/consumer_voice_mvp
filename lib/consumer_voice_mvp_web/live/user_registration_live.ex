defmodule ConsumerVoiceMvpWeb.UserRegistrationLive do
  use ConsumerVoiceMvpWeb, :live_view

  alias ConsumerVoiceMvp.{Accounts, Companies}
  alias ConsumerVoiceMvp.Accounts.User

  def render(assigns) do
    options = [
      "admin",
      "client",
      "employee"
    ]

    assigns = assign(assigns, :options, options)

    ~H"""
    <div class="mx-auto max-w-sm">
      <.header class="text-center">
        Register for an account
        <:subtitle>
          Already registered?
          <.link navigate={~p"/users/log_in"} class="font-semibold text-brand hover:underline">
            Log in
          </.link>
          to your account now.
        </:subtitle>
      </.header>

      <.simple_form
        for={@form}
        id="registration_form"
        phx-submit="save"
        phx-change="validate"
        phx-trigger-action={@trigger_submit}
        action={~p"/users/log_in?_action=registered"}
        method="post"
      >
        <.error :if={@check_errors}>
          Oops, something went wrong! Please check the errors below.
        </.error>

        <.input field={@form[:email]} type="email" label="Email" required />
        <.input field={@form[:password]} type="password" label="Password" required />
        <.input field={@form[:role]} type="select" label="Role" options={@options} />

        <%= if @is_employee do %>
          <.input field={@form[:company_id]} type="select" label="Company (If Your are Employee)" options={@companies} />
        <% end %>

        <:actions>
          <.button phx-disable-with="Creating account..." class="w-full">Create an account</.button>
        </:actions>
      </.simple_form>
    </div>
    """
  end

  def mount(_params, _session, socket) do
    changeset = Accounts.change_user_registration(%User{})
    companies = Companies.list_companies()

    socket =
      socket
      |> assign(
        trigger_submit: false,
        check_errors: false,
        is_employee: false,
        companies: Enum.map(companies, fn company -> {company.name, company.id} end)
      )
      |> assign_form(changeset)

    {:ok, socket, temporary_assigns: [form: nil]}
  end

  def handle_event("save", %{"user" => user_params}, socket) do
    # @todo "Handle company_id for employee registration"
    with {:ok, user} <- Accounts.register_user(user_params),
         {:ok, _} <- Accounts.add_employee(user) do
      {:ok, _} =
        Accounts.deliver_user_confirmation_instructions(
          user,
          &url(~p"/users/confirm/#{&1}")
        )

      changeset = Accounts.change_user_registration(user)
      {:noreply, socket |> assign(trigger_submit: true) |> assign_form(changeset)}
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        socket = assign_is_employee(socket, user_params["role"])
        {:noreply, socket |> assign(check_errors: true) |> assign_form(changeset)}
    end
  end

  def handle_event("validate", %{"user" => user_params}, socket) do
    socket = assign_is_employee(socket, user_params["role"])
    changeset = Accounts.change_user_registration(%User{}, user_params)
    {:noreply, assign_form(socket, Map.put(changeset, :action, :validate))}
  end

  defp assign_is_employee(socket, role) do
    assign(socket, is_employee: role === "employee")
  end

  defp assign_form(socket, %Ecto.Changeset{} = changeset) do
    form = to_form(changeset, as: "user")

    if changeset.valid? do
      assign(socket, form: form, check_errors: false)
    else
      assign(socket, form: form)
    end
  end
end
