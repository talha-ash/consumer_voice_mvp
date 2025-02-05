defmodule ConsumerVoiceMvpWeb.Router do
  use ConsumerVoiceMvpWeb, :router

  import ConsumerVoiceMvpWeb.UserAuth

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {ConsumerVoiceMvpWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug :fetch_current_user
    plug :put_user_token
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    # plug :fetch_live_flash
    plug :protect_from_forgery
    # plug :put_secure_browser_headers
    plug :validate_current_user
  end

  # Other scopes may use custom stacks.
  scope "/api", ConsumerVoiceMvpWeb do
    pipe_through :api
    resources "/companies", CompanyController, except: [:new, :edit]
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:consumer_voice_mvp, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: ConsumerVoiceMvpWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end

  ## Authentication routes

  scope "/", ConsumerVoiceMvpWeb do
    pipe_through [:browser, :redirect_if_user_is_authenticated]

    live_session :redirect_if_user_is_authenticated,
      on_mount: [{ConsumerVoiceMvpWeb.UserAuth, :redirect_if_user_is_authenticated}] do
      live "/users/register", UserRegistrationLive, :new
      live "/users/log_in", UserLoginLive, :new
      live "/users/reset_password", UserForgotPasswordLive, :new
      live "/users/reset_password/:token", UserResetPasswordLive, :edit
    end

    post "/users/log_in", UserSessionController, :create
  end

  scope "/", ConsumerVoiceMvpWeb do
    pipe_through [:browser, :require_authenticated_user]

    live_session :require_authenticated_user,
      root_layout: {ConsumerVoiceMvpWeb.Layouts, :auth_root},
      on_mount: [{ConsumerVoiceMvpWeb.UserAuth, :ensure_authenticated}] do
      live "/", HomeLive, :index
      live "/users/settings", UserSettingsLive, :edit
      live "/users/settings/confirm_email/:token", UserSettingsLive, :confirm_email
    end
  end

  scope "/", ConsumerVoiceMvpWeb do
    pipe_through [:browser]

    delete "/users/log_out", UserSessionController, :delete

    live_session :current_user,
      on_mount: [{ConsumerVoiceMvpWeb.UserAuth, :mount_current_user}] do
      live "/users/confirm/:token", UserConfirmationLive, :edit
      live "/users/confirm", UserConfirmationInstructionsLive, :new
    end
  end

  scope "/", ConsumerVoiceMvpWeb do
    pipe_through [:browser, :require_authenticated_user]

    live_session :redirect_on_route_not_matched,
      root_layout: {ConsumerVoiceMvpWeb.Layouts, :auth_root},
      on_mount: [{ConsumerVoiceMvpWeb.UserAuth, :ensure_authenticated}] do
      live "/*_", HomeLive, :index
    end
  end

end
