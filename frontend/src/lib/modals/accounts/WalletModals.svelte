<script lang="ts">
  import RenameSubAccountModal from "$lib/modals/accounts/RenameSubAccountModal.svelte";
  import HardwareWalletListNeuronsModal from "$lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";
  import type { WalletModal, WalletModalType } from "$lib/types/wallet.modal";

  let modal: WalletModal | undefined;
  const close = () => (modal = undefined);

  let type: WalletModalType | undefined;
  $: type = modal?.type;

  const onNnsWalletModal = ({ detail }: CustomEvent<WalletModal>) =>
    (modal = detail);
</script>

<svelte:window on:nnsWalletModal={onNnsWalletModal} />

{#if type === "rename"}
  <RenameSubAccountModal on:nnsClose={close} />
{/if}

{#if type === "hw-list-neurons"}
  <HardwareWalletListNeuronsModal on:nnsClose={close} />
{/if}
