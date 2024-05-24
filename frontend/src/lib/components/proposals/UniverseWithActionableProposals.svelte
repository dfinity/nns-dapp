<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
  import { InfiniteScroll } from "@dfinity/gix-components";

  export let universe: Universe;
</script>

<div class="container" data-tid="universe-with-actionable-proposals-component">
  <div class="summary" data-tid="projects-summary">
    <h1 class="title">
      <span class="title">{universe.title}</span>

      <UniverseLogo {universe} framed />
    </h1>
  </div>

  <InfiniteScroll layout="grid" disabled>
    <slot />
  </InfiniteScroll>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .container {
    margin-bottom: var(--padding-4x);
  }

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }

  .title {
    display: inline-flex;
  }

  span {
    @include fonts.h3;

    max-width: calc(100% - var(--padding-6x));
    @include text.truncate;

    margin: 0;
  }
</style>
