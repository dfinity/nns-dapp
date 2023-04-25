<script lang="ts">
</script>

<div class="neurons">
  <slot />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .neurons {
    padding: var(--padding-1_5x) var(--padding) 0;
    max-height: var(--voting-bottom-sheet-content-max-height);
    overflow-y: auto;

    position: relative;

    &:before {
      content: "";
      position: absolute;
      top: var(--padding-1_5x);
      right: 50%;
      border-top: 1px solid var(--tertiary);
      width: calc(100% - (4 * var(--padding)));
      transform: translate(50%, 0);
    }

    @include media.min-width(large) {
      max-height: inherit;
      padding: var(--padding) 0;

      &:before {
        width: 100%;
      }
    }

    :global(div.content-cell-title) {
      margin-top: var(--padding-4x);
    }

    :global(div.content-cell-details) {
      margin-top: 0;
    }
  }
</style>
