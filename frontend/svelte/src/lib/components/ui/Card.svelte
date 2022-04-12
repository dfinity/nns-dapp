<script lang="ts">
  export let role: "link" | "button" | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;

  let clickable: boolean = false;

  $: clickable = role !== undefined ? ["button", "link"].includes(role) : false;

  let showHeadline: boolean;
  $: showHeadline = $$slots.start !== undefined || $$slots.end !== undefined;
</script>

<article data-tid="card" {role} on:click class:clickable aria-label={ariaLabel}>
  {#if showHeadline}
    <div>
      <slot name="start" />
      <slot name="end" />
    </div>
  {/if}

  <slot />
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media.scss";
  @use "../../themes/mixins/display";

  article {
    text-decoration: none;

    background: var(--background);
    color: var(--gray-50);

    padding: var(--padding-2_5x);
    margin: var(--padding-2x) 0;
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
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @include media.min-width(small) {
      @include display.space-between;
      flex-direction: row;

      margin: 0 0 var(--padding);
    }
  }
</style>
