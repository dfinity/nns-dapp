<script lang="ts">
  import { Copy } from "@dfinity/gix-components";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import { stringifyJson } from "$lib/utils/utils";
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";

  export let actionKey: string | undefined;
  export let actionData: unknown | undefined;

  let copyContent = "";
  $: copyContent = stringifyJson(actionData, { indentation: 2 }) ?? "";
</script>

<div
  class="content-cell-island"
  data-tid="proposal-proposer-actions-entry-component"
>
  <div class="header">
    <h2
      class="content-cell-title header-text"
      data-tid="proposal-proposer-actions-entry-title"
    >
      {actionKey ?? ""}
      <Copy value={copyContent} />
    </h2>
    <TreeRawToggle />
  </div>

  <div
    class="content-cell-details"
    data-tid="proposal-proposer-actions-entry-fields"
  >
    <JsonPreview json={actionData} />
  </div>
</div>

<style lang="scss">
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-text {
    display: flex;
    align-items: center;
  }
</style>
