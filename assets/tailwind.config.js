/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../lib/consumer_voice_mvp_web.ex",
    "../lib/consumer_voice_mvp_web/**/*.*ex",
  ],
  prefix: "",
  theme: {},
  plugins: [
    require("@tailwindcss/forms"),
    // Allows prefixing tailwind classes with LiveView classes to add rules
    // only when LiveView classes are applied, for example:
    //
    //     <div class="phx-click-loading:animate-ping">
    //
    // plugin(({ addVariant }) =>
    //   addVariant("phx-no-feedback", [".phx-no-feedback&", ".phx-no-feedback &"])
    // ),
    // plugin(({ addVariant }) =>
    //   addVariant("phx-click-loading", [
    //     ".phx-click-loading&",
    //     ".phx-click-loading &",
    //   ])
    // ),
    // plugin(({ addVariant }) =>
    //   addVariant("phx-submit-loading", [
    //     ".phx-submit-loading&",
    //     ".phx-submit-loading &",
    //   ])
    // ),
    // plugin(({ addVariant }) =>
    //   addVariant("phx-change-loading", [
    //     ".phx-change-loading&",
    //     ".phx-change-loading &",
    //   ])
    // ),
  ],
};
