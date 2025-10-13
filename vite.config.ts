import { webfontDownload } from "vite-plugin-webfont-dl";
import devtoolsJson from "vite-plugin-devtools-json";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    webfontDownload(
      [
        "https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Patrick+Hand:wght@400;700&display=swap",
      ],
      {
        subsetsAllowed: ["latin", "latin-ext"],
      },
    ),
    tailwindcss(),
    sveltekit(),
    devtoolsJson(),
  ],

  build: {
    cssMinify: "lightningcss",
  },

  css: {
    transformer: "lightningcss",
  },
});
