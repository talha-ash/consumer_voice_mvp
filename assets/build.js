const esbuild = require("esbuild");
const postCssPlugin = require("esbuild-style-plugin");
const CssModulesPlugin = require("esbuild-css-modules-plugin");
const args = process.argv.slice(2);
const watch = args.includes("--watch");
const deploy = args.includes("--deploy");

const loader = {
  // Add loaders for images/fonts/etc, e.g. { '.svg': 'file' }
};

const plugins = [
  // Add and configure plugins here
  postCssPlugin({
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  }),
  CssModulesPlugin({
    // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
    force: true,
    emitDeclarationFile: true,
    localsConvention: "camelCaseOnly",
    namedExports: true,
    inject: false,
  }),
];

// Define esbuild options
let opts = {
  entryPoints: [
    "src/app.js",
    "src/client/main.tsx",
    "src/employee/main.tsx",
    "src/shared/app.css",
  ],
  bundle: true,
  logLevel: "info",
  target: "es2017",
  outdir: "../priv/static/assets",
  // external: ["*.css", "fonts/*", "images/*"],
  external: ["fonts/*", "images/*"],
  nodePaths: ["../deps"],
  loader: loader,
  plugins: plugins,
  define: {
    "global": 'window',
  }
};

if (deploy) {
  opts = {
    ...opts,
    minify: true,
  };
}

if (watch) {
  opts = {
    ...opts,
    sourcemap: "inline",
  };
  esbuild
    .context(opts)
    .then((ctx) => {
      ctx.watch();
    })
    .catch((_error) => {
      process.exit(1);
    });
} else {
  esbuild.build(opts);
}
