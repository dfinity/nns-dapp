import type { Account } from "$lib/types/account";
import {
  WALLET_CONTEXT_KEY,
  type WalletContext,
  type WalletStore,
} from "$lib/types/wallet.context";
import ContextWrapperTest from "$tests/lib/components/ContextWrapperTest.svelte";
import { render } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";
import { writable } from "svelte/store";

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
          neurons: [],
        }),
      } as WalletContext,
      Component: component,
    },
  });
