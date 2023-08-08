<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import InputWithError from "../ui/InputWithError.svelte";
  import { nonNullish } from "@dfinity/utils";

  export let text: string | undefined = undefined;
  export let placeholderLabelKey: string;
  export let disabledInput = false;
  export let disabledConfirm = false;
  export let errorMessage: string | undefined = undefined;
  export let testId: string | undefined = undefined;
  export let required = true;

  const dispatcher = createEventDispatcher();

  let showCancel: boolean;
  $: showCancel = nonNullish($$slots["cancel-text"]);
</script>

<form
  on:submit|preventDefault={() => dispatcher("nnsConfirmText")}
  data-tid={testId}
>
  <div>
    <p class="label"><slot name="label" /></p>
    <InputWithError
      inputType="text"
      {placeholderLabelKey}
      name="add-text-input"
      bind:value={text}
      disabled={disabledInput}
      {required}
      {errorMessage}
    />
  </div>

  <div class="toolbar">
    {#if showCancel}
      <button
        class="secondary"
        type="button"
        data-tid="cancel"
        on:click={() => dispatcher("nnsClose")}
      >
        <slot name="cancel-text" />
      </button>
    {/if}
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
