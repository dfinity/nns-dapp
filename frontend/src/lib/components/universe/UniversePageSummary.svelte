<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import UniverseLogo from "./UniverseLogo.svelte";
  import UniverseName from "./UniverseName.svelte";

  export let universe: Universe;
</script>

<div class="summary" data-tid="universe-page-summary-component">
  <UniverseLogo {universe} framed horizontalPadding={false} />
  <span><UniverseName {universe} /></span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .summary {
    display: flex;
    gap: var(--padding);
  }

  span {
    @include fonts.h3;
    @include text.truncate;
  }
</style>
