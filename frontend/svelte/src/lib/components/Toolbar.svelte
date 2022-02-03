<div class="toolbar" role="toolbar">
  <slot />
</div>

<style lang="scss">
  .toolbar {
    position: absolute;
    inset: 0;

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
      font-size: var(--font-size-h5);

      @media (min-width: 768px) {
        margin: 30px 20px;
        width: 436px;

        font-size: var(--font-size-h4);
      }
      // </tmp_styles>
    }
  }
</style>
