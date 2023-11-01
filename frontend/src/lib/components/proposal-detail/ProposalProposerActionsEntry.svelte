<script lang="ts">
  import { Copy } from "@dfinity/gix-components";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import { stringifyJson } from "$lib/utils/utils";
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";
  import { ENABLE_FULL_WIDTH_PROPOSAL } from "$lib/stores/feature-flags.store";
  import Json from "$lib/components/common/Json.svelte";

  export let actionKey: string | undefined;
  export let actionData: unknown | undefined;

  let copyContent = "";
  $: copyContent = stringifyJson(actionData, { indentation: 2 }) ?? "";
</script>

<div
  class="content-cell-island"
  data-tid="proposal-proposer-actions-entry-component"
>
  {#if $ENABLE_FULL_WIDTH_PROPOSAL}
    <div class="header">
      <div class="title-copy">
        <h2
          class="content-cell-title header-text"
          data-tid="proposal-proposer-actions-entry-title"
        >
          {actionKey ?? ""}
        </h2>
        <Copy value={copyContent} />
      </div>
      <TreeRawToggle />
    </div>

    <div
      class="content-cell-details"
      data-tid="proposal-proposer-actions-entry-fields"
    >
      <JsonPreview json={actionData} />
    </div>
  {:else}
    <h2
      class="content-cell-title"
      data-tid="proposal-proposer-actions-entry-title"
    >
      {actionKey ?? ""}
    </h2>

    <div
      class="content-cell-details"
      data-tid="proposal-proposer-actions-entry-fields"
    >
      <Json json={actionData} />
    </div>
  {/if}
</div>

<style lang="scss">
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-copy {
      display: flex;
      align-items: center;
    }
  }

  .header-text {
    display: flex;
    align-items: center;
  }
</style>
