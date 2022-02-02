<script lang="ts">
  export let role: string = undefined;

  const clickableRoles = ["button", "link"];
</script>

<article {role} on:click class={clickableRoles.includes(role) && "clickable"}>
  <div>
    <slot name="start" />
    <slot name="end" />
  </div>

  <slot />
</article>

<style lang="scss">
  article {
    display: block;
    text-decoration: none;

    background: var(--background);
    color: var(--gray-50);

    padding: calc(2.5 * var(--padding));
    margin: calc(2 * var(--padding)) 0;
    border-radius: var(--border-radius);

    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);
  }

  .clickable:hover {
    background: var(--background-hover);
    cursor: pointer;
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
