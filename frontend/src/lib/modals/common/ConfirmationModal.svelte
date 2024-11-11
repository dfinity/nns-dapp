<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal, busy } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let testId = "confirmation-modal-component";
  export let yesLabel: string | undefined = undefined;

  const dispatch = createEventDispatcher();
</script>

<Modal role="alert" on:nnsClose {testId}>
  <div class="wrapper">
    <article data-tid="confirmation-modal-content">
      <slot />
    </article>
    <div class="footer">
      <button
        data-tid="confirm-no"
        disabled={$busy}
        class="secondary"
        on:click={() => dispatch("nnsClose")}
      >
        {$i18n.core.confirm_no}
      </button>
      <button
        data-tid="confirm-yes"
        disabled={$busy}
        class="primary"
        on:click={() => dispatch("nnsConfirm")}
      >
        {yesLabel ?? $i18n.core.confirm_yes}
      </button>
    </div>
  </div>
</Modal>

<style lang="scss">
  .wrapper {
    padding: 0 var(--padding);
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--padding-2x);
  }
</style>
