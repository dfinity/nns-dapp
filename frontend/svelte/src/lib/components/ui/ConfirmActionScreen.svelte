<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { busy } from "../../stores/busy.store";

  const dispatcher = createEventDispatcher();
  const confirm = async () => {
    dispatcher("nnsConfirm");
  };
</script>

<div class="wizard-wrapper" data-tid="confirm-action-screen">
  <div class="info">
    <div class="main">
      <slot name="main-info" />
    </div>
    <slot />
  </div>
  <div>
    <button
      class="primary full-width"
      data-tid="confirm-action-button"
      disabled={$busy}
      on:click={confirm}
    >
      <slot name="button-content" />
    </button>
  </div>
</div>

<style lang="scss">
  .info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--padding-3x);
      flex-grow: 1;
    }
  }
</style>
