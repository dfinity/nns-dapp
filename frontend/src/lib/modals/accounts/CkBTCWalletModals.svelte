<script lang="ts">
  import type {
    CkBTCWalletModal,
    CkBTCWalletModalType,
  } from "$lib/types/wallet.modal";
  import { nonNullish } from "@dfinity/utils";
  import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
  import CkBTCTransactionWalletModal from "$lib/modals/accounts/CkBTCTransactionWalletModal.svelte";
  import type {
    CkBTCWalletReceiveModalData,
    CkBTCWalletTransactionModalData,
  } from "../../types/wallet.modal";

  let modal: CkBTCWalletModal | undefined;
  const close = () => (modal = undefined);

  let type: CkBTCWalletModalType | undefined;
  $: type = modal?.type;

  let data:
    | CkBTCWalletTransactionModalData
    | CkBTCWalletReceiveModalData
    | undefined;
  $: data = (modal as CkBTCWalletModal | undefined)?.data;

  let receiveData: CkBTCWalletReceiveModalData | undefined;
  $: receiveData = data as CkBTCWalletReceiveModalData | undefined;

  let transactionData: CkBTCWalletTransactionModalData | undefined;
  $: transactionData = data as CkBTCWalletTransactionModalData | undefined;
</script>

<svelte:window on:ckBTCWalletModal={({ detail }) => (modal = detail)} />

{#if type === "ckbtc-receive" && nonNullish(receiveData)}
  <CkBTCReceiveModal data={receiveData} on:nnsClose={close} />
{/if}

{#if type === "ckbtc-transaction" && nonNullish(transactionData)}
  <CkBTCTransactionWalletModal data={transactionData} on:nnsClose={close} />
{/if}
