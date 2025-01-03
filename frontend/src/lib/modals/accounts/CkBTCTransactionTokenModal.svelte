<script lang="ts">
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import CkBTCTransactionModal from "$lib/modals/accounts/CkBTCTransactionModal.svelte";
  import type { TokensStoreUniverseData } from "$lib/stores/tokens.store";
  import type { Account } from "$lib/types/account";
  import type { CkBTCTransactionModalData } from "$lib/types/ckbtc-accounts.modal";
  import type { CkBTCAdditionalCanisters } from "$lib/types/ckbtc-canisters";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { nonNullish, type TokenAmountV2 } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let data: CkBTCTransactionModalData;

  let canisters: CkBTCAdditionalCanisters;
  let universeId: UniverseCanisterId;
  let account: Account | undefined;
  let reloadAccountFromStore: (() => void) | undefined;

  $: ({ account, reloadAccountFromStore, universeId, canisters } = data);

  const dispatcher = createEventDispatcher();

  const onTransferReloadSelectedAccount = async () => {
    reloadAccountFromStore?.();
    dispatcher("nnsClose");
  };

  let token: TokensStoreUniverseData | undefined = undefined;
  $: token = $ckBTCTokenStore[universeId.toText()];

  let transactionFee: TokenAmountV2 | undefined = undefined;
  $: transactionFee = $ckBTCTokenFeeStore[universeId.toText()];
</script>

{#if nonNullish(token) && nonNullish(transactionFee)}
  <CkBTCTransactionModal
    on:nnsClose
    on:nnsTransfer={onTransferReloadSelectedAccount}
    selectedAccount={account}
    token={token.token}
    {transactionFee}
    {universeId}
    {canisters}
  />
{/if}
