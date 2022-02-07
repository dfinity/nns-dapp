<div>
  <slot />
</div>

<style lang="scss">
  div {
    display: inline-block;

    font-size: var(--font-size-small);

    background: var(--gray-800);
    color: var(--gray-50);

    padding: calc(var(--padding) / 2) var(--padding);
    margin: calc(var(--padding) / 2);

    border-radius: calc(2 * var(--border-radius));
  }
</style>
