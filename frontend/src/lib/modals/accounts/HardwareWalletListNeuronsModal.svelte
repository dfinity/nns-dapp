<script lang="ts">
  import HardwareWalletNeurons from "$lib/components/accounts/HardwareWalletNeurons.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.neurons.title}</span>

  <div>
    <HardwareWalletNeurons />
  </div>
</Modal>
