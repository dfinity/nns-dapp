<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let disabled = false;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const FADE_IN_DURATION = 75 as const;
  const FADE_OUT_DURATION = 250 as const;
</script>

<div
  in:fade={{ duration: FADE_IN_DURATION }}
  out:fade={{ duration: FADE_OUT_DURATION }}
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
