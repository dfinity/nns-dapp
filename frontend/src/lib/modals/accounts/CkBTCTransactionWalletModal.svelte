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
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { TokenAmount } from "@dfinity/nns";

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

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = $ckBTCTokenStore[universeId.toText()];

  let transactionFee: TokenAmount | undefined = undefined;
  $: transactionFee = $ckBTCTokenFeeStore[universeId.toText()];
</script>

{#if nonNullish(token) && nonNullish(transactionFee)}
  <CkBTCTransactionModal
    on:nnsClose
    on:nnsTransfer={onTransferReloadSelectedAccount}
    selectedAccount={account}
    loadTransactions
    token={token.token}
    {transactionFee}
    {universeId}
  />
{/if}
