import type { Account } from "$lib/types/account";
import {
  WALLET_CONTEXT_KEY,
  type WalletContext,
  type WalletStore,
} from "$lib/types/wallet.context";
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
      contextKey: WALLET_CONTEXT_KEY,
      contextValue: {
        store: writable<WalletStore>({
          account,
        }),
      } as WalletContext,
      Component: component,
    },
  });
