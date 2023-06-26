<script lang="ts">
  import type { Account } from "$lib/types/account";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import type { CkBTCTransactionModalData } from "$lib/types/ckbtc-accounts.modal";
  import { createEventDispatcher } from "svelte";
  import { nonNullish } from "@dfinity/utils";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { TokenAmount } from "@dfinity/utils";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";

  export let data: CkBTCTransactionModalData;

  let canisters: CkBTCAdditionalCanisters;
  let universeId: UniverseCanisterId;
  let account: Account | undefined;
  let reloadAccountFromStore: (() => void) | undefined;
  let loadTransactions: boolean;

  $: ({ account, reloadAccountFromStore, universeId, canisters } = data);

  const dispatcher = createEventDispatcher();

  const onTransferReloadSelectedAccount = async () => {
    reloadAccountFromStore?.();
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
    {loadTransactions}
    token={token.token}
    {transactionFee}
    {universeId}
    {canisters}
  />
{/if}
