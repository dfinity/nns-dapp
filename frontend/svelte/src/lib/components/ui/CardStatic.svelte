<script lang="ts">
  let showHeadline: boolean;
  $: showHeadline = $$slots.start !== undefined || $$slots.end !== undefined;
</script>

<article>
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

    padding: var(--padding-2x) 0;
    margin: var(--padding-4x) 0;

    outline: 2px solid transparent;

    box-shadow: none;
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
