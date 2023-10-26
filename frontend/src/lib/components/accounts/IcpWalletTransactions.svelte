<script lang="ts">
  import IcpWalletObserver from "$lib/components/accounts/IcpWalletObserver.svelte";
  import type { WalletObserverData } from "$lib/types/icrc.observer";
  import type { WalletCallback } from "$lib/services/worker-icp-wallet.services";
  import { isNullish, jsonReviver, nonNullish } from "@dfinity/utils";
  import type { PostMessageDataResponseWallet } from "$lib/types/post-message.icp-transactions";
  import type { TransactionWithId } from "@junobuild/ledger";
  import TransactionList from "$lib/components/accounts/TransactionList.svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  let data: WalletObserverData | undefined;
  $: data = nonNullish($store.account)
    ? {
        account: $store.account,
        // TODO: env variable
        indexCanisterId: "qhbym-qaaaa-aaaaa-aaafq-cai",
      }
    : undefined;

  let transactions: TransactionWithId[] = [];

  const callback: WalletCallback = (data: PostMessageDataResponseWallet) => {
    if (isNullish(data.wallet)) {
      return;
    }

    transactions = [
      ...JSON.parse(data.wallet.newTransactions, jsonReviver),
      ...transactions,
    ];
  };
</script>

{#if nonNullish(data)}
  <IcpWalletObserver {data} {callback}>
    <TransactionList {transactions} />
  </IcpWalletObserver>
{/if}
