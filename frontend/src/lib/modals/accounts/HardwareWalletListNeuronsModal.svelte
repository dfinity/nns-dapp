<script lang="ts">
  import LegacyModal from "$lib/components/modals/LegacyModal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import HardwareWalletNeurons from "$lib/components/accounts/HardwareWalletNeurons.svelte";
</script>

<LegacyModal on:nnsClose size="big">
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons />
  </div>
</LegacyModal>

<style lang="scss">
  div {
    padding: var(--padding-2x);
  }
</style>
