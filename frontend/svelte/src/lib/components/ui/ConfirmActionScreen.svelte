<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Spinner from "./Spinner.svelte";

  export let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  const confirm = async () => {
    dispatcher("nnsConfirm");
  };
</script>

<div class="wizard-wrapper" data-tid="confirm-action-screen">
  <div class="main-info">
    <slot name="main-info" />
  </div>
  <div class="info">
    <slot />
  </div>
  <div>
    <button
      class="primary full-width"
      data-tid="confirm-action-button"
      disabled={loading}
      on:click={confirm}
    >
      {#if loading}
        <Spinner />
      {:else}
        <slot name="button-content" />
      {/if}
    </button>
  </div>
</div>

<style lang="scss">
  .main-info {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--padding-3x);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    flex-grow: 1;
  }
</style>
