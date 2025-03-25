import type { Account } from "$lib/types/account";
import {
  WALLET_CONTEXT_KEY,
  type WalletStore,
} from "$lib/types/wallet.context";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { render } from "$tests/utils/svelte.test-utils";
import type { RenderResult } from "@testing-library/svelte";
import { waitFor } from "@testing-library/svelte";
import type { Component } from "svelte";
import { writable } from "svelte/store";

// TODO: rename and move this modal.mock.ts to modal.test-utils.ts

export const waitModalIntroEnd = async ({
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

export const modalToolbarSelector = "div.content";

export const renderModal = async ({
  component,
  props,
  events,
}: {
  component: Component;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
  events?: Record<string, ($event: CustomEvent) => void>;
}): Promise<RenderResult<Component>> => {
  const modal = render(component, {
    props,
    events,
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
  Component: Component;
  contextKey: symbol;
  contextValue: T;
}): Promise<RenderResult<Component>> => {
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
  Component: Component;
  account: Account | undefined;
}): Promise<RenderResult<Component>> =>
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
