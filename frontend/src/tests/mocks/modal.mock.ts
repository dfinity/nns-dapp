import type { Account } from "$lib/types/account";
import {
  WALLET_CONTEXT_KEY,
  type WalletStore,
} from "$lib/types/wallet.context";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import type { RenderResult } from "@testing-library/svelte";
import { render, waitFor } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";

// TODO: rename and move this modal.mock.ts to modal.test-utils.ts

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

const modalToolbarSelector = "div.content";

export const renderModal = async ({
  component,
  props,
}: {
  component: typeof SvelteComponent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}): Promise<RenderResult<SvelteComponent>> => {
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
}): Promise<RenderResult<SvelteComponent>> => {
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
}): Promise<RenderResult<SvelteComponent>> =>
  renderModalContextWrapper({
    contextKey: WALLET_CONTEXT_KEY,
    contextValue: {
      store: writable<WalletStore>({
        account,
        neurons: [],
      }),
    },
    Component,
  });
