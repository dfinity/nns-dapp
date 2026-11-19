<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { fade } from "svelte/transition";
  import { i18n } from "$lib/gix/stores/i18n";
  import { handleKeyPress } from "$lib/gix/utils/keyboard.utils";

  export let disablePointerEvents = false;
  export let invisible = false;

  const dispatch = createEventDispatcher();
  const close = () => dispatch("nnsClose");

  const FADE_IN_DURATION = 75 as const;
  const FADE_OUT_DURATION = 250 as const;
</script>

<div
  class="backdrop"
  class:disablePointerEvents
  class:visible={!invisible}
  aria-label={$i18n.core.close}
  data-tid="backdrop"
  role="button"
  tabindex="-1"
  on:click|stopPropagation={close}
  on:keypress={($event) => handleKeyPress({ $event, callback: close })}
  in:fade|global={{ duration: FADE_IN_DURATION }}
  out:fade|global={{ duration: FADE_OUT_DURATION }}
></div>

<style lang="scss">
  @use "../styles/mixins/interaction";
  @use "../styles/mixins/display";

  .backdrop {
    position: absolute;
    @include display.inset;

    color: var(--backdrop-contrast);

    z-index: var(--backdrop-z-index);

    @include interaction.tappable;

    &.visible {
      background: var(--backdrop);
      backdrop-filter: var(--backdrop-filter);
    }

    &.disablePointerEvents {
      @include interaction.none;
    }
  }
</style>
