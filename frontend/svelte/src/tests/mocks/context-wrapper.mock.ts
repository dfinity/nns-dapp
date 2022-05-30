import type { RenderResult } from "@testing-library/svelte";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import type { Account } from "../../lib/types/account";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountStore,
} from "../../lib/types/selected-account.context";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";

export const renderContextWrapper = <T>({
  Component,
  contextKey,
  contextValue,
}: {
  Component: typeof SvelteComponent;
  contextKey: symbol;
  contextValue: T;
}): RenderResult =>
  render(ContextWrapperTest, {
    props: {
      contextKey,
      contextValue,
      Component,
    },
  });

export const renderSelectedAccountContext = ({
  Component,
  account,
}: {
  Component: typeof SvelteComponent;
  account: Account | undefined;
}): RenderResult =>
  renderContextWrapper({
    contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
    contextValue: {
      store: writable<SelectedAccountStore>({
        account,
        transactions: undefined,
      }),
    },
    Component,
  });
