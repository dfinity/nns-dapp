<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let disabled = false;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");
</script>

<div
  in:fade={{ duration: 75 }}
  out:fade={{ duration: 250 }}
  class="backdrop"
  on:click|stopPropagation={close}
  class:disabledActions={disabled}
/>

<style lang="scss">
  @use "../../themes/mixins/interaction";

  .backdrop {
    position: absolute;
    inset: 0;

    background: rgba(var(--background-rgb), 0.8);

    @include interaction.tappable;

    &.disabledActions {
      cursor: inherit;
      pointer-events: none;
    }
  }
</style>
