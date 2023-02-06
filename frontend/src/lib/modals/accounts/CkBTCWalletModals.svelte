<script lang="ts">
  import type {
    CkBTCWalletModal,
    CkBTCWalletModalType,
  } from "$lib/types/wallet.modal";
  import { nonNullish } from "$lib/utils/utils";
  import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";

  let modal: CkBTCWalletModal | undefined;
  const close = () => (modal = undefined);

  let type: CkBTCWalletModalType | undefined;
  $: type = modal?.type;

  let btcAddress: string | undefined;
  $: btcAddress = (modal as CkBTCWalletModal | undefined)?.data?.btcAddress;

  $: console.log(btcAddress, type, modal);
</script>

<svelte:window on:ckBTCWalletModal={({ detail }) => (modal = detail)} />

{#if type === "ckbtc-receive" && nonNullish(btcAddress)}
  <CkBTCReceiveModal {btcAddress} on:nnsClose={close} />
{/if}
