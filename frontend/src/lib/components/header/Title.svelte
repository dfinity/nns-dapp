<script lang="ts">
  import { triggerDebugReport } from "$lib/directives/debug.directives";
  import { layoutTitleStore } from "$lib/stores/layout.store";

  $: pageTitle = $layoutTitleStore.title + " | Network Nervous System";
  $: toolbarTitle = $layoutTitleStore.header || $layoutTitleStore.title;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div use:triggerDebugReport>
  <h1>{toolbarTitle}</h1>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  h1 {
    background-color: var(--cp-light-50-45);
    @include text.truncate;
    border-radius: 45px;
    padding: 4px 12px;
    line-height: 20px;
    font-size: 14px;
    margin: 0;
  }

  @include media.dark-theme {
    h1 {
      background-color: var(--neutral-blue-a10);
    }
  }

  div {
    max-width: inherit;
  }
</style>
