<script lang="ts">
  import type { TransactionsObserverData } from "$lib/types/icrc.observer";
  import { nonNullish } from "@dfinity/utils";
  import { snsProjectSelectedStore } from "$lib/derived/sns/sns-selected-project.derived";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";
  import IcrcTransactionsObserver from "$lib/components/accounts/IcrcTransactionsObserver.svelte";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  let data: TransactionsObserverData | undefined;
  $: data =
    nonNullish($store.account) && nonNullish($snsProjectSelectedStore)
      ? {
          account: $store.account,
          indexCanisterId:
            $snsProjectSelectedStore.summary.indexCanisterId.toText(),
        }
      : undefined;

  const callback = (something) => console.log("MSG", something);
</script>

{#if nonNullish(data)}
  <IcrcTransactionsObserver {data} {callback}>
    <slot />
  </IcrcTransactionsObserver>
{/if}
