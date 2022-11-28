<script lang="ts">
  import { walletModal } from "$lib/stores/modal.store";
  import RenameSubAccountModal from "$lib/modals/accounts/RenameSubAccountModal.svelte";
  import HardwareWalletListNeuronsModal from "$lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";

  const close = () => walletModal.set(undefined);
</script>

{#if $walletModal === "rename"}
  <RenameSubAccountModal on:nnsClose={close} />
{/if}

{#if $walletModal === "hw-list-neurons"}
  <HardwareWalletListNeuronsModal on:nnsClose={close} />
{/if}
