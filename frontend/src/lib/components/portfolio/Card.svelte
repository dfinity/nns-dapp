<article><slot /></article>

<style lang="scss">
  article {
    height: auto;
    box-sizing: border-box;
    background: var(--card-background);
    /* Designs use a different shadow */
    box-shadow: var(--box-shadow);
    transition: color var(--animation-time-normal);
    /*  Designs define it as 16px */
    border-radius: var(--border-radius);
  }
</style>
