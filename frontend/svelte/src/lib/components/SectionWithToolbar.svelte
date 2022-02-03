<section>
  <div class="wrapper">
    <div class="content">
      <slot />
    </div>
  </div>
  {#if $$slots.toolbar}
    <div class="toolbar" role="toolbar">
      <slot name="toolbar" />
    </div>
  {/if}
</section>

<style lang="scss">
  section {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    // wrapper for scrollable content
    .wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: auto;

      .content {
        padding: calc(2 * var(--padding)) calc(4 * var(--padding));
        // because of bottom gradient
        padding-bottom: var(--section-toolbar-height);

        max-width: var(--section-content-max-width);
        margin: 0 auto;
      }
    }

    // bottom gradient
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--section-toolbar-height);

      z-index: 1;

      pointer-events: none;

      background: linear-gradient(
        0deg,
        rgba(var(--black-rgb), 1) 10%,
        rgba(var(--black-rgb), 0) 100%
      );
    }
  }

  .toolbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--section-toolbar-height);

    z-index: 2;

    // enable scrolling
    pointer-events: none;

    display: flex;
    justify-content: center;
    align-items: end;

    // buttons
    & > :global(button) {
      pointer-events: all;

      // TODO: remove <tmp_styles>
      background: var(--blue-400);
      padding: 10px;
      border-radius: 10px;
      color: white;

      margin: 25px 5px;
      width: 186px;

      @media (min-width: 768px) {
        margin: 30px 20px;
        width: 436px;
      }
      // </tmp_styles>
    }
  }
</style>
