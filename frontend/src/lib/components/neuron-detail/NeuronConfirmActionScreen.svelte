<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  const dispatcher = createEventDispatcher();
  const confirm = () => dispatcher("nnsConfirm");
  const cancel = () => dispatcher("nnsCancel");
</script>

<TestIdWrapper testId="neuron-confirm-action-screen-component">
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
</TestIdWrapper>

<style lang="scss">
  p {
    margin-bottom: var(--padding-2x);
  }
</style>
