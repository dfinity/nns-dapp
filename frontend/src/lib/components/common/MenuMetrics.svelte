<script lang="ts">
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
  import { layoutMenuOpen } from "@dfinity/gix-components";

  export let sticky = true;
</script>

<div class:open={$layoutMenuOpen} class:sticky>
  <TotalValueLocked layout="stacked" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  div {
    display: flex;
    justify-content: center;

    padding: var(--padding-8x) var(--padding-2x) var(--padding-2x);

    transition: transform linear var(--animation-time-normal),
      opacity linear calc(var(--animation-time-short) / 2);
    transform: translate(-150%, 0);
    opacity: 0;

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
      // On xlarge screen the menu can be always open
      @include media.min-width(xlarge) {
        @include open;
      }
    }
  }
</style>
