<div>
  <slot />
</div>

<style lang="scss">
  div {
    display: inline-block;

    font-size: var(--font-size-small);

    background: var(--gray-800);
    color: var(--gray-50);

    padding: var(--padding-half) var(--padding);
    margin: var(--padding-half);

    border-radius: calc(2 * var(--border-radius));
  }
</style>
