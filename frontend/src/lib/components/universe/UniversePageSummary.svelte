<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import UniverseLogo from "./UniverseLogo.svelte";

  export let universe: Universe;
</script>

<span class="summary" data-tid="universe-page-summary-component">
  <UniverseLogo {universe} framed horizontalPadding={false} />
  <span class="summary-title">{universe.title}</span>
  <slot name="tags" />
  <slot name="actions" />
</span>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .summary {
    display: flex;
    gap: var(--padding);
  }

  .summary-title {
    @include fonts.h3;
    @include text.truncate;
  }
</style>
