<script lang="ts">
  export let to: string = undefined;
</script>

{#if to}
  <a href={to}>
    <div>
      <slot name="start" />
      <slot name="end" />
    </div>

    <slot />
  </a>
{:else}
  <article>
    <div>
      <slot name="start" />
      <slot name="end" />
    </div>

    <slot />
  </article>
{/if}

<style lang="scss">
  article,
  a {
    display: block;
    text-decoration: none;

    background: var(--background);
    color: var(--gray-50);

    padding: calc(2.5 * var(--padding));
    margin: calc(2 * var(--padding)) 0;
    border-radius: var(--border-radius);

    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);
  }

  a:hover {
    background: var(--background-hover);
  }

  div {
    display: inline-flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;

    margin: 0 0 var(--padding);

    @media (max-width: 768px) {
      display: block;
    }
  }

  article :global(p) {
    margin: 0;
  }
</style>
