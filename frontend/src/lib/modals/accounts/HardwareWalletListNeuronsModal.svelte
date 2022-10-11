<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import HardwareWalletNeurons from "$lib/components/accounts/HardwareWalletNeurons.svelte";
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons />
  </div>
</Modal>

