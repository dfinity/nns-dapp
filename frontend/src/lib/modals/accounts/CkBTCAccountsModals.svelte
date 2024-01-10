<script lang="ts">
  import type {
    CkBTCWalletModal,
    CkBTCWalletModalData,
    CkBTCWalletModalType,
    CkBTCReceiveModalData,
    CkBTCTransactionModalData,
  } from "$lib/types/ckbtc-accounts.modal";
  import { nonNullish } from "@dfinity/utils";
  import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
  import CkBTCTransactionTokenModal from "$lib/modals/accounts/CkBTCTransactionTokenModal.svelte";

  let modal: CkBTCWalletModal | undefined;
  const close = () => (modal = undefined);

  let type: CkBTCWalletModalType | undefined;
  $: type = modal?.type;

  let data: CkBTCWalletModalData | CkBTCReceiveModalData | undefined;
  $: data = (modal as CkBTCWalletModal | undefined)?.data;

  let receiveData: CkBTCReceiveModalData | undefined;
  $: receiveData = data as CkBTCReceiveModalData | undefined;

  let transactionData: CkBTCTransactionModalData | undefined;
  $: transactionData = data as CkBTCTransactionModalData | undefined;

  const onNnsCkBTCAccountsModal = ({ detail }: CustomEvent<CkBTCWalletModal>) =>
    (modal = detail);
</script>

<svelte:window on:nnsCkBTCAccountsModal={onNnsCkBTCAccountsModal} />

{#if type === "ckbtc-receive" && nonNullish(receiveData)}
  <CkBTCReceiveModal data={receiveData} on:nnsClose={close} />
{/if}

{#if type === "ckbtc-transaction" && nonNullish(transactionData)}
  <CkBTCTransactionTokenModal data={transactionData} on:nnsClose={close} />
{/if}
