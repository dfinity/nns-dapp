import type { RenderResult } from "@testing-library/svelte";
import { render, waitFor } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import type { Account } from "../../lib/types/account";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountStore,
} from "../../lib/types/selected-account.context";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";

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

export const renderModalContextWrapper = async <T>({
  Component,
  contextKey,
  contextValue,
}: {
  Component: typeof SvelteComponent;
  contextKey: symbol;
  contextValue: T;
}): Promise<RenderResult> => {
  const modal = render(ContextWrapperTest, {
    props: {
      contextKey,
      contextValue,
      Component,
    },
  });

  const { container } = modal;
  await waitModalIntroEnd({ container, selector: modalToolbarSelector });

  return modal;
};

export const renderModalSelectedAccountContextWrapper = ({
  Component,
  account,
}: {
  Component: typeof SvelteComponent;
  account: Account | undefined;
}): Promise<RenderResult> =>
  renderModalContextWrapper({
    contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
    contextValue: {
      store: writable<SelectedAccountStore>({
        account,
        transactions: undefined,
      }),
    },
    Component,
  });
