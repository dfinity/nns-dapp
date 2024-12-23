<article><slot /></article>

<style lang="scss">
  article {
    height: auto;
    box-sizing: border-box;
    background: var(--card-background);
    /* Designs use a different shadow */
    box-shadow: var(--box-shadow);
    transition:
      color var(--animation-time-normal),
      box-shadow var(--animation-time-normal);
    border-radius: var(--border-radius-2x);
  }
</style>
