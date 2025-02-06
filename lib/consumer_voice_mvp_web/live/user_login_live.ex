defmodule ConsumerVoiceMvpWeb.UserLoginLive do
  use ConsumerVoiceMvpWeb, :live_view

  def render(assigns) do
    ~H"""
    <div class="mx-auto">
      <.header class="text-center">
        Log in to account
      </.header>
      
    <!-- Login Form -->
      <div class="max-w-sm mx-auto">
        <.simple_form for={@form} id="login_form" action={~p"/users/log_in"} phx-update="ignore">
          <.input field={@form[:email]} type="email" label="Email" required />
          <.input field={@form[:password]} type="password" label="Password" required />

          <:actions>
            <.input field={@form[:remember_me]} type="checkbox" label="Keep me logged in" />
            <.link href={~p"/users/reset_password"} class="text-sm font-semibold">
              Forgot your password?
            </.link>
          </:actions>
          <:actions>
            <.button phx-disable-with="Logging in..." class="w-full">
              Log in <span aria-hidden="true">→</span>
            </.button>
          </:actions>
        </.simple_form>
      </div>
      
    <!-- Test Accounts -->
      <div class=" p-2">
        <h2 class="text-2xl font-bold mb-6 text-center text-indigo-800">Test Accounts</h2>
        
    <!-- Grid Layout for Client and Employee Accounts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Client Accounts -->
          <div class="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg">
            <div class="p-4 border-b border-blue-400">
              <h3 class="font-bold text-xl text-white">Client Accounts</h3>
            </div>
            <div class="p-6 space-y-3">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div class="grid grid-cols-2 gap-2">
                  <p class="text-blue-100">user1@voice.com</p>
                  <p class="text-blue-100">user2@voice.com</p>
                  <p class="text-blue-100">user3@voice.com</p>
                  <p class="text-blue-100">user4@voice.com</p>
                  <p class="text-blue-100">user5@voice.com</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-blue-400">
                <p class="text-white"><span class="font-medium">Password:</span> password12345</p>
              </div>
            </div>
          </div>
          
    <!-- Employee Accounts -->
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg shadow-lg">
            <div class="p-4 border-b border-emerald-400">
              <h3 class="font-bold text-xl text-white">Employee Accounts</h3>
            </div>
            <div class="p-6 space-y-3">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div class="grid grid-cols-2 gap-2">
                  <p class="text-emerald-100">employee1@voice.com</p>
                  <p class="text-emerald-100">employee2@voice.com</p>
                  <p class="text-emerald-100">employee3@voice.com</p>
                  <p class="text-emerald-100">employee4@voice.com</p>
                  <p class="text-emerald-100">employee5@voice.com</p>
                  <p class="text-emerald-100">employee6@voice.com</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-emerald-400">
                <p class="text-white"><span class="font-medium">Password:</span> password12345</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    <!-- Call Flow Process -->
      <div class="max-w-6xl mx-auto p-6">
        <h2 class="text-2xl font-bold text-indigo-900 mb-6">Call Flow Process</h2>
        
    <!-- Horizontal Timeline Layout -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
          <!-- Step 1 -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center mb-3">
              <span class="bg-blue-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                1
              </span>
              <h3 class="text-lg font-semibold text-blue-900">Client Selects Company</h3>
            </div>
            <ul class="ml-11 space-y-2 text-blue-800">
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                <span>System identifies all employees of selected company</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                <span>Filters for online employees</span>
              </li>
            </ul>
          </div>
          
    <!-- Step 2 -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center mb-3">
              <span class="bg-emerald-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                2
              </span>
              <h3 class="text-lg font-semibold text-emerald-900">Call Routing</h3>
            </div>
            <ul class="ml-11 space-y-2 text-emerald-800">
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                <span>Routes to first available online employee</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                <span>Employee receives incoming call notification</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                <span>Can accept or reject within timeout period</span>
              </li>
            </ul>
          </div>
          
    <!-- Step 3 -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center mb-3">
              <span class="bg-purple-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                3
              </span>
              <h3 class="text-lg font-semibold text-purple-900">Call Handling</h3>
            </div>
            <ul class="ml-11 space-y-2 text-purple-800">
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                <span>If accepted: Connect call</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                <span>If rejected: Try next online employee</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                <span>If no online employees or all reject: Wait up to 1 minute for employee to come online</span>
              </li>
            </ul>
          </div>
          
    <!-- Step 4 -->
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <div class="flex items-center mb-3">
              <span class="bg-red-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
                4
              </span>
              <h3 class="text-lg font-semibold text-red-900">Timeout Behavior</h3>
            </div>
            <ul class="ml-11 space-y-2 text-red-800">
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                <span>After 1 minute without available employee</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                <span>Notify client no employees available</span>
              </li>
              <li class="flex items-center">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                <span>Call Drop</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    """
  end

  def mount(_params, _session, socket) do
    email = Phoenix.Flash.get(socket.assigns.flash, :email)
    form = to_form(%{"email" => email}, as: "user")
    {:ok, assign(socket, form: form), temporary_assigns: [form: form]}
  end
end
