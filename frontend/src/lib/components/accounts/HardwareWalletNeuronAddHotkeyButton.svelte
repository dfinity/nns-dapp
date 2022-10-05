<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { NeuronId } from "@dfinity/nns";
  import HardwareWalletNeuronAddHotkeyModal from "$lib/components/modals/accounts/HardwareWalletNeuronAddHotkeyModal.svelte";

  export let neuronId: NeuronId;

  let modalOpen = false;
</script>

<button
  class="primary"
  type="button"
  on:click={() => (modalOpen = true)}
  data-tid="open-hardware-wallet-add-hotkey-button"
  >{$i18n.accounts.attach_hardware_neurons_add}</button
>

{#if modalOpen}
  <HardwareWalletNeuronAddHotkeyModal
    {neuronId}
    on:nnsClose={() => (modalOpen = false)}
  />
{/if}
