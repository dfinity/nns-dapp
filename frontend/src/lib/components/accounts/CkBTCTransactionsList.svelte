<!-- Expose getters and setters to access properties in a testing context -->
<svelte:options accessors />

<script lang="ts">
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import {
    ckBTCInfoStore,
    type CkBTCInfoStoreUniverseData,
  } from "$lib/stores/ckbtc-info.store";
  import { ckbtcPendingUtxosStore } from "$lib/stores/ckbtc-pending-utxos.store";
  import { ckbtcRetrieveBtcStatusesStore } from "$lib/stores/ckbtc-retrieve-btc-statuses.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type {
    IcrcTransactionData,
    UiTransaction,
  } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import {
    mapCkbtcPendingUtxo,
    mapCkbtcTransactions,
  } from "$lib/utils/icrc-transactions.utils";
  import type { PendingUtxo } from "@dfinity/ckbtc";
  import { isNullish } from "@dfinity/utils";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;

  export const reloadTransactions = () => transactions?.reloadTransactions?.();

  let transactions: IcrcWalletTransactionsList;

  let ckbtcInfo: CkBTCInfoStoreUniverseData | undefined = undefined;
  $: ckbtcInfo = $ckBTCInfoStore[universeId.toText()];

  let kytFee: bigint | undefined = undefined;
  $: kytFee = ckbtcInfo?.info.kyt_fee;

  let pendingUtxos: PendingUtxo[] = [];
  $: pendingUtxos = $ckbtcPendingUtxosStore[universeId.toText()] ?? [];

  const mapPendingUtxos = ({
    pendingUtxos,
    token,
    kytFee,
  }: {
    pendingUtxos: PendingUtxo[];
    token: IcrcTokenMetadata;
    kytFee: bigint;
  }): UiTransaction[] =>
    pendingUtxos.map((utxo) =>
      mapCkbtcPendingUtxo({
        utxo,
        token,
        kytFee,
        i18n: $i18n,
      })
    );

  // Incoming BTC transactions that are still awaiting enough confirmations.
  // We wait to display them until completed transactions are loaded as well.
  let pendingTransactions: UiTransaction[];
  $: pendingTransactions =
    isNullish(token) || isNullish(kytFee)
      ? []
      : mapPendingUtxos({
          pendingUtxos,
          token,
          kytFee,
        });

  const mapTransactions = (
    transactionData: IcrcTransactionData[]
  ): UiTransaction[] => {
    const completedTransactions = mapCkbtcTransactions({
      transactionData,
      account,
      token,
      i18n: $i18n,
      retrieveBtcStatuses:
        $ckbtcRetrieveBtcStatusesStore[universeId.toText()] || [],
    });
    return [...pendingTransactions, ...completedTransactions];
  };
</script>

<IcrcWalletTransactionsList
  bind:this={transactions}
  {indexCanisterId}
  {account}
  ledgerCanisterId={universeId}
  {token}
  {mapTransactions}
/>
