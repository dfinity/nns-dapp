<script lang="ts">
  export let role: "link" | "button" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;

  let clickable: boolean = false;

  $: clickable = role !== undefined ? ["button", "link"].includes(role) : false;
</script>

<article {role} on:click class:clickable aria-label={ariaLabel}>
  <div>
    <slot name="start" />
    <slot name="end" />
  </div>

  <slot />
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media.scss";

  article {
    text-decoration: none;

    background: var(--background);
    color: var(--gray-50);

    padding: calc(2.5 * var(--padding));
    margin: calc(2 * var(--padding)) 0;
    border-radius: var(--border-radius);

    box-shadow: 0 4px 16px 0 rgba(var(--background-rgb), 0.3);
  }

  .clickable {
    @include interaction.tappable;

    &:focus,
    &:hover {
      background: var(--background-hover);
    }
  }

  div {
    display: inline-flex;
    justify-content: space-between;
    align-items: flex-start;

    width: 100%;

    margin: 0 0 var(--padding);
  }
</style>
