import { nonNullish } from "@dfinity/utils";
import {
  render as svelteRender,
  type RenderResult,
} from "@testing-library/svelte";
import type { Component, ComponentProps } from "svelte";

// prettier-ignore
// @ts-expect-error Testing-library type not exposed
import type { MountOptions } from "@testing-library/svelte/types/component-types";
// prettier-ignore
// @ts-expect-error Testing-library type not exposed
import type { ComponentType } from "@testing-library/svelte/types/component-types";

// Adapted from Svelte render to work around the surprising behavior that render
// reuses the same container element between different calls from the same test.
export const render = <C extends Component>(
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

  const mountOptions: Partial<MountOptions<ComponentProps<C>>> =
    nonNullish(componentOptions) && "events" in componentOptions
      ? {
          // TODO: remove once events are migrated to callback props
          events: componentOptions?.events,
        }
      : {};

  const { component, ...rest } = svelteRender(
    cmp,
    {
      props: props ?? {},
      ...mountOptions,
    },
    {
      ...renderOptions,
      baseElement: container,
    }
  );

  return { component, ...rest };
};
