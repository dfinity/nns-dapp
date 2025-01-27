import { nonNullish } from "@dfinity/utils";
import {
  render as svelteRender,
  type RenderResult,
} from "@testing-library/svelte";
import type { ComponentProps, SvelteComponent } from "svelte";

// TestingLibrary internal type
type ComponentType<C> = C extends SvelteComponent
  ? new (...args: unknown[]) => C
  : C;

// Adapted from Svelte render to work around the surprising behavior that render
// reuses the same container element between different calls from the same test.
export const render = <C extends SvelteComponent>(
  cmp: ComponentType<C>,
  componentOptions?:
    | {
        props: ComponentProps<C>;
        events?: Record<string, ($event: CustomEvent) => void>;
      }
    | ComponentProps<C>,
  renderOptions = {}
): RenderResult<C> => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const props = nonNullish(componentOptions)
    ? "props" in componentOptions
      ? componentOptions.props
      : componentOptions
    : {};

  const { component, ...rest } = svelteRender(cmp, props, {
    ...renderOptions,
    baseElement: container,
  });

  const allEvents = Object.entries(
    nonNullish(componentOptions) && "events" in componentOptions
      ? (componentOptions.events ?? {})
      : {}
  );

  allEvents.forEach(([event, fn]) => {
    component.$on(event, fn);
  });

  return { component, ...rest };
};
