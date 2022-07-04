<script lang="ts">
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";

  export let disablePointerEvents = false;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const FADE_IN_DURATION = 75 as const;
  const FADE_OUT_DURATION = 250 as const;
</script>

<div
  role="button"
  aria-label={$i18n.core.close}
  in:fade={{ duration: FADE_IN_DURATION }}
  out:fade={{ duration: FADE_OUT_DURATION }}
  class="backdrop"
  on:click|stopPropagation={close}
  class:disablePointerEvents
/>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/display";

  .backdrop {
    position: absolute;
    @include display.inset;

    background: var(--backdrop);
    color: var(--backdrop-contrast);

    @include interaction.tappable;

    &.disablePointerEvents {
      cursor: inherit;
      pointer-events: none;
    }
  }
</style>
