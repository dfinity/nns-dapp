import {
  render as svelteRender,
  type RenderResult,
} from "@testing-library/svelte";
import type { Component, ComponentProps } from "svelte";
// prettier-ignore
// @ts-expect-error Testing-library type not exposed
import type { ComponentType,MountOptions } from "@testing-library/svelte/types/component-types";

export const render = <C extends Component>(
  cmp: ComponentType<C>,
  options?: {
    props?: ComponentProps<C>;
    events?: Record<string, ($event: CustomEvent) => void>;
  }
): RenderResult<C> => {
  const mountOptions: Partial<MountOptions<ComponentProps<C>>> = {
    // TODO: remove once events are migrated to callback props
    events: options?.events,
  };

  return svelteRender(cmp, {
    props: options?.props,
    ...mountOptions,
  });
};
