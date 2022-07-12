import App from "./App.svelte";
import { ENABLE_XXX_FEATURE } from "./lib/constants/environment.constants";

console.log({ ENABLE_XXX_FEATURE });

const app = new App({
  target: document.body,
  props: {},
});

export default app;
