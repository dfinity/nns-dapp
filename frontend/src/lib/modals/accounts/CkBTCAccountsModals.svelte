<script lang="ts">
  import type {
    CkBTCWalletModal,
    CkBTCWalletModalData,
    CkBTCWalletModalType,
    CkBTCReceiveModalData,
    CkBTCWalletTransactionModalData,
  } from "$lib/types/ckbtc-accounts.modal";
  import { nonNullish } from "@dfinity/utils";
  import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
  import CkBTCTransactionWalletModal from "$lib/modals/accounts/CkBTCTransactionWalletModal.svelte";

  let modal: CkBTCWalletModal | undefined;
  const close = () => (modal = undefined);

  let type: CkBTCWalletModalType | undefined;
  $: type = modal?.type;

  let data:
    | CkBTCWalletModalData
    | CkBTCWalletTransactionModalData
    | CkBTCReceiveModalData
    | undefined;
  $: data = (modal as CkBTCWalletModal | undefined)?.data;

  let receiveData: CkBTCReceiveModalData | undefined;
  $: receiveData = data as CkBTCReceiveModalData | undefined;

  let transactionData: CkBTCWalletTransactionModalData | undefined;
  $: transactionData = data as CkBTCWalletTransactionModalData | undefined;
</script>

<svelte:window on:nnsCkBTCAccountsModal={({ detail }) => (modal = detail)} />

{#if type === "ckbtc-receive" && nonNullish(receiveData)}
  <CkBTCReceiveModal data={receiveData} on:nnsClose={close} />
{/if}

{#if type === "ckbtc-wallet-transaction" && nonNullish(transactionData)}
  <CkBTCTransactionWalletModal data={transactionData} on:nnsClose={close} />
{/if}
