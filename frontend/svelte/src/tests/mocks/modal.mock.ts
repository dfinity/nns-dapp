import type { RenderResult } from "@testing-library/svelte";
import { render, waitFor } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

const waitModalIntroEnd = async ({
  container,
  selector,
}: {
  container: HTMLElement;
  selector: string;
}) => {
  // Testing library does not implement on:introend that's why we fake the event
  const event = new CustomEvent("introend");
  container.querySelector('div[role="dialog"]')?.dispatchEvent(event);

  await waitFor(() => expect(container.querySelector(selector)).not.toBeNull());
};

const modalToolbarSelector = "div.toolbar";

export const renderModal = async ({
  component,
  props,
}: {
  component: typeof SvelteComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}): Promise<RenderResult> => {
  const modal = render(component, {
    props,
  });

  const { container } = modal;
  await waitModalIntroEnd({ container, selector: modalToolbarSelector });

  return modal;
};
