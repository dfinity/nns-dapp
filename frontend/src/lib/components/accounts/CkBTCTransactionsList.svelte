<!-- Expose getters and setters to access properties in a testing context -->
<svelte:options accessors />

<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { mapCkbtcTransaction } from "$lib/utils/icrc-transactions.utils";
  import type {
    UiTransaction,
    IcrcTransactionData,
  } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;

  export const reloadTransactions = () => transactions?.reloadTransactions?.();

  let transactions: IcrcWalletTransactionsList;

  const mapTransactions = (
    transactionData: IcrcTransactionData[]
  ): UiTransaction[] =>
    transactionData
      .map((transaction: IcrcTransactionData) =>
        mapCkbtcTransaction({
          ...transaction,
          account,
          token,
          i18n: $i18n,
        })
      )
      .filter(nonNullish);
</script>

<IcrcWalletTransactionsList
  bind:this={transactions}
  {indexCanisterId}
  {account}
  {universeId}
  {token}
  {mapTransactions}
/>
