<div class="toolbar" role="toolbar">
  <slot />
</div>

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  .toolbar {
    position: absolute;
    inset: 0;

    // enable scrolling
    pointer-events: none;

    margin: 0 auto var(--padding-2x);

    display: flex;
    justify-content: center;
    align-items: end;
    gap: var(--padding);

    @include media.min-width(xsmall) {
      min-width: 280px;
      width: 70%;
    }

    @include media.min-width(medium) {
      margin-bottom: var(--padding-3x);
      gap: var(--padding-2x);
    }

    // buttons
    > :global(button),
    > :global(.tooltip-wrapper) {
      pointer-events: all;

      padding: 0;
      flex: 1 1;

      @include media.min-width(medium) {
        max-width: 220px;
      }
    }
  }
</style>
