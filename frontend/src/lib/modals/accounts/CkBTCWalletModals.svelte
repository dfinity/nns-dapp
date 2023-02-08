<script lang="ts">
  import type {
    CkBTCWalletModal,
    CkBTCWalletModalData,
    CkBTCWalletModalType,
  } from "$lib/types/wallet.modal";
  import { nonNullish } from "$lib/utils/utils";
  import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";

  let modal: CkBTCWalletModal | undefined;
  const close = () => (modal = undefined);

  let type: CkBTCWalletModalType | undefined;
  $: type = modal?.type;

  let data: CkBTCWalletModalData | undefined;
  $: data = (modal as CkBTCWalletModal | undefined)?.data;
</script>

<svelte:window on:ckBTCWalletModal={({ detail }) => (modal = detail)} />

{#if type === "ckbtc-receive" && nonNullish(data)}
  <CkBTCReceiveModal {data} on:nnsClose={close} />
{/if}
