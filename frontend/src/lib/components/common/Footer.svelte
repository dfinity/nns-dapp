<script lang="ts">
  import { Toolbar } from "@dfinity/gix-components";

  export let columns = 2;
</script>

<footer style={`--footer-columns: ${columns}`}>
  <Toolbar>
    <slot />
  </Toolbar>
</footer>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  footer {
    height: var(--footer-height);

    will-change: transform;
    pointer-events: none;

    background: var(--footer-background);

    :global(.toolbar) {
      align-items: end;
      margin: 0 auto max(env(safe-area-inset-bottom), var(--padding-2x));
    }

    :global(.main) {
      display: grid;
      --footer-main-inner-width: calc(
        100% - (2 * var(--padding-0_5x)) -
          ((var(--footer-columns) - 1) * var(--padding-0_5x))
      );
      grid-template-columns: repeat(
        auto-fit,
        calc(var(--footer-main-inner-width) / var(--footer-columns))
      );

      padding: var(--padding-0_5x);
      background: var(--focus-background);
      border-radius: var(--border-radius);

      gap: var(--padding-0_5x);

      @include media.min-width(small) {
        grid-template-columns: repeat(
          auto-fit,
          minmax(calc(var(--footer-main-inner-width) / 2), 180px)
        );
      }

      @include media.min-width(medium) {
        margin-bottom: var(--padding-2x);
      }

      :global(div.tooltip-wrapper) {
        width: 100%;
      }
    }
  }
</style>
