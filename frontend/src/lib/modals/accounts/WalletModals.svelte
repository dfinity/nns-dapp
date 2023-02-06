<script lang="ts">
  import RenameSubAccountModal from "$lib/modals/accounts/RenameSubAccountModal.svelte";
  import HardwareWalletListNeuronsModal from "$lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";
  import type { WalletModal, WalletType } from "$lib/types/wallet.modal";

  let modal: WalletModal | undefined;
  const close = () => (modal = undefined);

  let type: WalletType | undefined;
  $: type = modal?.type;
</script>

<svelte:window on:nnsWalletModal={({ detail }) => (modal = detail)} />

{#if type === "rename"}
  <RenameSubAccountModal on:nnsClose={close} />
{/if}

{#if type === "hw-list-neurons"}
  <HardwareWalletListNeuronsModal on:nnsClose={close} />
{/if}
