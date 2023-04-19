<script lang="ts">
  export let id: string;
</script>

<slot name="title" />

<ul aria-labelledby={id}>
  <slot />
</ul>

<style lang="scss">
  ul {
    display: flex;
    gap: calc(0.5 * var(--padding));
    flex-wrap: wrap;

    list-style: none;

    margin: var(--padding-0_5x) 0 var(--padding) 0;
    padding: 0 0 calc(2 * var(--padding));

    &:not(:last-of-type) {
      border-bottom: 1px solid var(--line);
    }
  }
</style>
