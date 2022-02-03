<section>
  <div class="content">
    <slot />
  </div>
  <footer>
    <slot name="footer" />
  </footer>
</section>

<style lang="scss">
  @use "../themes/mixins/img";

  section {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;

    .content {
      padding: calc(2 * var(--padding)) calc(4 * var(--padding));
      // because of bg
      padding-bottom: var(--section-footer-height);

      max-width: var(--section-max-width);
      margin: 0 auto;
    }
  }

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--section-footer-height);

    // enable scrolling
    pointer-events: none;

    display: flex;
    justify-content: center;
    align-items: end;
  }

  // bg
  footer::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: -1;

    background: linear-gradient(
      0deg,
      rgba(var(--black-rgb), 1) 10%,
      rgba(var(--black-rgb), 0) 100%
    );
  }

  // buttons
  footer :global(button) {
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
</style>
