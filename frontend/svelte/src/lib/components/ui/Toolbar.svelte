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

    @include media.min-width(xsmall) {
      min-width: 280px;
      width: 70%;
    }

    @include media.min-width(medium) {
      margin-bottom: var(--padding-3x);
    }

    // buttons
    :global(button) {
      pointer-events: all;

      flex: 1 1;
      margin: 0 var(--padding-0_5x);
      max-width: 60%;

      @include media.min-width(medium) {
        margin: 0 var(--padding-2x);
        max-width: 406px;
      }

      @media (max-width: 450px) {
        height: 70px;
      }
    }
  }
</style>
