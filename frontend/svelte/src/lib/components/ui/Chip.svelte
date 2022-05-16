<div>
  <slot />
</div>

<style lang="scss">
  div {
    display: inline-block;

    font-size: var(--font-size-small);

    background: var(--gray-800);
    color: var(--gray-50);

    padding: var(--padding-0_5x) var(--padding);
    margin: var(--padding-0_5x);

    border-radius: calc(2 * var(--border-radius));
  }
</style>
