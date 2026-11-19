<script lang="ts">
  import HardwareWalletNeurons from "$lib/components/accounts/HardwareWalletNeurons.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "$lib/gix";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");
</script>

<Modal onClose={close}>
  {#snippet title()}<span>{$i18n.neurons.title}</span>{/snippet}

  <div>
    <HardwareWalletNeurons />
  </div>
</Modal>
