<script lang="ts">
  import { triggerDebugReport } from "$lib/directives/debug.directives";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { HeaderTitle } from "@dfinity/gix-components";

  let pageTitle = "NNS Dapp";
  $: pageTitle = `${$layoutTitleStore.title ?? ""}${
    $layoutTitleStore.title !== "" ? ` / ` : ""
  }NNS Dapp`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div use:triggerDebugReport>
  <HeaderTitle
    >{$layoutTitleStore.header ?? $layoutTitleStore.title}</HeaderTitle
  >
</div>

<style lang="scss">
  div {
    max-width: inherit;
  }
</style>
