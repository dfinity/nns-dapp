import App from "./App.svelte";
import { HttpAgent } from "@dfinity/agent";

const app = new App({
  target: document.body,
  props: {},
});

window["cli"] = {
  foo: 5,
  HttpAgent,
};

export default app;
