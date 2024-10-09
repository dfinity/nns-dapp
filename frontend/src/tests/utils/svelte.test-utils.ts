import { render as svelteRender } from "@testing-library/svelte";

// Adapted from Svelte render to work around the surprising behavior that render
// reuses the same container element between different calls from the same test.
export const render = (
  component,
  componentOptions = {},
  renderOptions = {}
) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return svelteRender(component, componentOptions, {
    ...renderOptions,
    baseElement: container,
  });
};
