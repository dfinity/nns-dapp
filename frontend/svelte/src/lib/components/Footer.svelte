<script>
</script>

<footer>
  <slot />
</footer>

<div class="place-holder" />

<style lang="scss">
  @use "../themes/mixins/img";

  .place-holder {
    height: var(--section-footer-height);
  }

  footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    height: var(--section-footer-height);

    display: flex;
    justify-content: center;
    align-items: end;

    background: var(--background);
    background: linear-gradient(
      0deg,
      rgba(11, 12, 12, 1) 10%,
      rgba(11, 12, 12, 0) 100%
    );

    // don't block parent scroll
    pointer-events: none;
  }

  footer :global(button) {
    pointer-events: all;

    // TODO: remove <tmp_styles>
    background: var(--blue-400);
    padding: 10px;
    border-radius: 10px;
    color: white;
    // </tmp_styles>

    margin: 25px 5px;
    width: 186px;

    @media (min-width: 768px) {
      margin: 30px 20px;
      width: 436px;
    }
  }
</style>
