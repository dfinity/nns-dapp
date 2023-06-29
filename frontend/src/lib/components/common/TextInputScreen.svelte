<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Input from "../ui/Input.svelte";

  export let text: string | undefined = undefined;
  export let placeholderLabelKey: string;
  export let busy = false;
  export let disabledConfirm = false;
  export let testId: string | undefined = undefined;

  const dispatcher = createEventDispatcher();
  const confirmText = () => {
    dispatcher("nnsConfirmText");
  };
</script>

<form on:submit|preventDefault={confirmText} data-tid={testId}>
  <div>
    <p class="label"><slot name="label" /></p>
    <Input
      inputType="text"
      {placeholderLabelKey}
      name="add-text-input"
      bind:value={text}
      disabled={busy}
    />
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel"
      on:click={() => dispatcher("nnsClose")}
    >
      <slot name="cancel-text" />
    </button>
    <button
      class="primary"
      type="submit"
      data-tid="confirm-text-input-screen-button"
      disabled={disabledConfirm}
    >
      <slot name="confirm-text" />
    </button>
  </div>
</form>

<style lang="scss">
  .label {
    margin: 0;
  }
</style>
