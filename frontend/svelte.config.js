import adapter from "@sveltejs/adapter-static";
import autoprefixer from "autoprefixer";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({
    postcss: {
      plugins: [autoprefixer],
    },
  }),

  kit: {
    adapter: adapter({
      pages: 'public',
      assets: 'public',
      fallback: 'index.html',
      precompress: false
    }),
    serviceWorker: {
      register: false,
    },
  },
};

export default config;
