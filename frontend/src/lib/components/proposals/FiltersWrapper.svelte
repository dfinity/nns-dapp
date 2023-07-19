<div class="filters" data-tid="filter-wrapper-component">
  <slot />
</div>

<style lang="scss">
  .filters {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0 var(--padding-3x);

    --checkbox-flex-direction: row-reverse;
    --checkbox-font-size: var(--font-size-small);

    :global(button) {
      margin: var(--padding) var(--padding) 0 0;
    }

    > :global(div.checkbox) {
      width: fit-content;
      padding: var(--padding) calc(0.75 * var(--padding));
      margin: var(--padding) 0 0;
    }
  }

  :global(section > div.checkbox) {
    margin: 0 0 var(--padding);
  }
</style>
