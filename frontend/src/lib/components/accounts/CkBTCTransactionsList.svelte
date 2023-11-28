<!-- Expose getters and setters to access properties in a testing context -->
<svelte:options accessors />

<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { mapCkbtcTransaction } from "$lib/utils/icrc-transactions.utils";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { CanisterId } from "$lib/types/canister";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import IcrcWalletTransactionsList from "$lib/components/accounts/IcrcWalletTransactionsList.svelte";

  export let indexCanisterId: CanisterId;
  export let universeId: UniverseCanisterId;
  export let account: Account;
  export let token: IcrcTokenMetadata | undefined;

  export const reloadTransactions = () => transactions?.reloadTransactions?.();

  let transactions: IcrcWalletTransactionsList;
</script>

<IcrcWalletTransactionsList
  bind:this={transactions}
  {indexCanisterId}
  {account}
  {universeId}
  {token}
  mapTransaction={mapCkbtcTransaction}
/>
