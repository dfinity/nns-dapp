<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal, busy } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  export let testId = "confirmation-modal-component";
  export let yesLabel: string | undefined = undefined;

  const dispatch = createEventDispatcher();
</script>

<Modal role="alert" on:nnsClose {testId}>
  <article data-tid="confirmation-modal-content">
    <slot />
  </article>

  <svelte:fragment slot="footer">
    <button
      data-tid="confirm-no"
      disabled={$busy}
      on:click={() => dispatch("nnsClose")}
      class="secondary">{$i18n.core.confirm_no}</button
    >
    <button
      data-tid="confirm-yes"
      disabled={$busy}
      class="primary"
      on:click={() => dispatch("nnsConfirm")}
      >{yesLabel ?? $i18n.core.confirm_yes}</button
    >
  </svelte:fragment>
</Modal>

<style lang="scss">
  article {
    padding: 0 var(--padding);
  }
</style>
