<div class="toolbar" role="toolbar">
  <slot />
</div>

<style lang="scss">
  .toolbar {
    position: absolute;
    inset: 0;

    // enable scrolling
    pointer-events: none;

    margin: 0 auto calc(2 * var(--padding));

    display: flex;
    justify-content: center;
    align-items: end;

    @media (min-width: 300px) {
      min-width: 280px;
      width: 70%;
    }

    @media (min-width: 768px) {
      margin-bottom: calc(3 * var(--padding));
      // same as section
      padding: 0 calc(3 * var(--padding));
    }

    // buttons
    :global(button) {
      pointer-events: all;

      flex: 1 1;
      margin: 0 calc(0.5 * var(--padding));
      max-width: 60%;

      @media (min-width: 768px) {
        margin: 0 calc(2 * var(--padding));
        max-width: 406px;
      }
    }
  }
</style>
