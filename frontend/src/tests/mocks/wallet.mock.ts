import type { Account } from "$lib/types/account";
import {
  SELECTED_ACCOUNT_CONTEXT_KEY,
  type SelectedAccountContext,
  type SelectedAccountStore,
} from "$lib/types/selected-account.context";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";
import ContextWrapperTest from "../lib/components/ContextWrapperTest.svelte";

export const renderWalletActions = ({
  account,
  component,
}: {
  account: Account | undefined;
  component: typeof SvelteComponent;
}) =>
  render(ContextWrapperTest, {
    props: {
      contextKey: SELECTED_ACCOUNT_CONTEXT_KEY,
      contextValue: {
        store: writable<SelectedAccountStore>({
          account,
        }),
      } as SelectedAccountContext,
      Component: component,
    },
  });
