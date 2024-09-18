<script lang="ts">
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
  import { ENABLE_METRICS } from "$lib/constants/mockable.constants";
  import { layoutMenuOpen, menuCollapsed } from "@dfinity/gix-components";

  export let sticky = true;
</script>

{#if ENABLE_METRICS}
  <div
    class:open={$layoutMenuOpen}
    class:hidden={$menuCollapsed && !$layoutMenuOpen}
    class:sticky
  >
    <TotalValueLocked layout="stacked" />
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div {
    display: none;
    justify-content: center;

    transition:
      transform linear var(--animation-time-normal),
      opacity linear calc(var(--animation-time-short) / 2);

    @mixin hidden {
      transform: translate(-150%, 0);
      opacity: 0;
    }

    @include hidden;

    @mixin open {
      transform: translate(0, 0);
      opacity: 1;

      :global(div) {
        word-break: break-all;
      }
    }

    &.open {
      @include open;
    }

    &.sticky {
      // On large screen the menu can be always open
      @include media.min-width(large) {
        @include open;
      }
    }

    &.hidden {
      @include hidden;
      width: calc(var(--menu-expanded-width) - var(--padding-4x));
    }

    @media (min-height: 654px) {
      display: flex;
    }
  }
</style>
