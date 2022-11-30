<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let id: string;

  const dispatcher = createEventDispatcher();
  const onClick = () => {
    dispatcher("nnsTitleClick");
  };
</script>

<button {id} class="text" on:click={onClick} data-tid="tag-list-title">
  <slot name="title" />
</button>

<ul aria-labelledby={id}>
  <slot />
</ul>

<style lang="scss">
  button {
    margin: 0 0 calc(0.5 * var(--padding));
    font-size: var(--font-size-h5);
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
