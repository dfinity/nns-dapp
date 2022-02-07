<div>
  <slot />
</div>

<style lang="scss">
  div {
    border: 2px solid var(--badge-border-color, red);
    padding: var(--padding);
    border-radius: var(--border-radius);
    width: fit-content;
  }
</style>
