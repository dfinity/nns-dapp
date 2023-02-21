<script lang="ts">
  import type { Account } from "$lib/types/account";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import type { CkBTCWalletTransactionModalData } from "$lib/types/wallet.modal";
  import { createEventDispatcher } from "svelte";
  import { nonNullish } from "@dfinity/utils";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import type { UniverseCanisterId } from "$lib/types/universe";

  export let data: CkBTCWalletTransactionModalData;

  let universeId: UniverseCanisterId;
  let account: Account;
  let reloadAccountFromStore: () => void;

  $: ({ account, reloadAccountFromStore, universeId } = data);

  const dispatcher = createEventDispatcher();

  const onTransferReloadSelectedAccount = async () => {
    reloadAccountFromStore();
    dispatcher("nnsClose");
  };
</script>

{#if nonNullish($ckBTCTokenStore) && nonNullish($ckBTCTokenFeeStore)}
  <CkBTCTransactionModal
    on:nnsClose
    on:nnsTransfer={onTransferReloadSelectedAccount}
    selectedAccount={account}
    loadTransactions
    token={$ckBTCTokenStore.token}
    transactionFee={$ckBTCTokenFeeStore}
    {universeId}
  />
{/if}
