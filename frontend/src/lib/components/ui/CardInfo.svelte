<script lang="ts">
  import ColumnRow from "./ColumnRow.svelte";

  // Same data-tid as <Card /> for backwards compatibility with existing jest test
  export let testId = "card";

  let showHeadline: boolean;
  $: showHeadline = $$slots.start !== undefined || $$slots.end !== undefined;
</script>

<article data-tid={testId}>
  {#if showHeadline}
    <ColumnRow>
      <slot name="start" slot="start" />
      <slot name="end" slot="end" />
    </ColumnRow>
  {/if}

  <slot />
</article>

<style lang="scss">
  article {
    text-decoration: none;

    padding: var(--padding-2x) 0;
    margin: var(--padding-2x) 0;

    outline: 2px solid transparent;

    box-shadow: none;
  }
</style>
