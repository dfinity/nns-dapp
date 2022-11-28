<script lang="ts">
  import RenameSubAccountModal from "$lib/modals/accounts/RenameSubAccountModal.svelte";
  import HardwareWalletListNeuronsModal from "$lib/modals/accounts/HardwareWalletListNeuronsModal.svelte";
  import {
    WALLET_CONTEXT_KEY,
    type WalletContext,
  } from "$lib/types/wallet.context";
  import { getContext } from "svelte";

  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  const close = () => store.update((data) => ({ ...data, modal: undefined }));
</script>

{#if $store.modal === "rename"}
  <RenameSubAccountModal on:nnsClose={close} />
{/if}

{#if $store.modal === "hw-list-neurons"}
  <HardwareWalletListNeuronsModal on:nnsClose={close} />
{/if}
