<script lang="ts">
  import type { Account } from "$lib/types/account";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import type { CkBTCTransactionModalData } from "$lib/types/ckbtc-accounts.modal";
  import { nonNullish } from "@dfinity/utils";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { TokenAmount } from "@dfinity/nns";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import { createEventDispatcher } from "svelte";

  export let data: CkBTCTransactionModalData;

  let canisters: CkBTCAdditionalCanisters;
  let universeId: UniverseCanisterId;
  let account: Account | undefined;

  $: ({ account, universeId, canisters } = data);

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = $ckBTCTokenStore[universeId.toText()];

  let transactionFee: TokenAmount | undefined = undefined;
  $: transactionFee = $ckBTCTokenFeeStore[universeId.toText()];

  const dispatcher = createEventDispatcher();
</script>

{#if nonNullish(token) && nonNullish(transactionFee)}
  <CkBTCTransactionModal
    on:nnsClose
    selectedAccount={account}
    loadTransactions
    token={token.token}
    {transactionFee}
    {universeId}
    {canisters}
    on:nnsTransfer={() => dispatcher("nnsClose")}
  />
{/if}
