<script lang="ts">
  export let id: string;
</script>

<div data-tid="tag-list-title">
  <slot name="title" />
</div>

<ul aria-labelledby={id}>
  <slot />
</ul>

<style lang="scss">
  div {
    margin: 0 0 calc(0.5 * var(--padding));
  }

  ul {
    display: flex;
    gap: calc(0.5 * var(--padding));
    flex-wrap: wrap;

    list-style: none;

    margin-bottom: var(--padding);
    padding: 0 0 calc(2 * var(--padding));
    border-bottom: 1px solid currentColor;
  }
</style>
