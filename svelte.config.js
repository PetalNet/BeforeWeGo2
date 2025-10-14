import adapter from "@sveltejs/adapter-auto";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default /** @satisfies {import("@sveltejs/kit").Config} */ ({
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({ style: false }),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),

    experimental: {
      remoteFunctions: true,
    },

    typescript: {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- JS
      config(/** @type {Record<string, unknown>} */ config) {
        config["include"] = /** @type {string[]} */ (config["include"]).flatMap(
          (path) => path.replace("vite.config", "*.config"),
        );
      },
    },
  },

  compilerOptions: {
    experimental: {
      async: true,
    },
  },
});
