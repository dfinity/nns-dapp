import {
  render as svelteRender,
  type RenderResult,
} from "@testing-library/svelte";
import {
  type Component,
  type ComponentProps,
  type SvelteComponent as LegacyComponent,
} from "svelte";

// Duplicate Testing-library ComponentType which is not exposed
type ComponentType<C> = C extends LegacyComponent
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]) => C
  : C;

// Adapted from Svelte render to work around the surprising behavior that render
// reuses the same container element between different calls from the same test.
export const render = <C extends Component>(
  component: ComponentType<C>,
  props?: ComponentProps<C>,
  renderOptions = {},
  events?: Record<string, ($event: CustomEvent) => void>
): RenderResult<C> => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return svelteRender(
    component,
    {
      props: props ?? {},
      // TODO: remove once events are migrated to callback props
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      events,
    },
    {
      ...renderOptions,
      baseElement: container,
    }
  );
};
