<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  const dispatcher = createEventDispatcher();
  const confirm = () => dispatcher("nnsConfirm");
  const cancel = () => dispatcher("nnsCancel");
</script>

<p class="label"><slot /></p>

<div class="toolbar">
  <button class="secondary" on:click={cancel} data-tid="cancel-action-button">
    {$i18n.neuron_detail.edit_percentage}
  </button>
  <button
    class="primary"
    data-tid="confirm-action-button"
    disabled={$busy}
    on:click={confirm}
  >
    {$i18n.core.confirm}
  </button>
</div>

<style lang="scss">
  p {
    margin-bottom: var(--padding-2x);
  }
</style>
