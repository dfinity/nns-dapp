<script lang="ts">
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { expandObject, stringifyJson } from "$lib/utils/utils";
  import { Copy, SkeletonText } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";

  // `undefined` means that the payload is not loaded yet
  // `null` means that the payload was not found
  // `object` means that the payload is an object
  export let payload: object | undefined | null;

  let copyContent = "";
  $: copyContent = stringifyJson(payload, { indentation: 2 }) ?? "";

  let expandedPayload: unknown;
  $: expandedPayload = isNullish(payload) ? payload : expandObject(payload);
</script>

<div class="content-cell-island">
  {#if expandedPayload !== undefined}
    <div class="header">
      <h3
        class="content-cell-title header-text"
        data-tid="proposal-proposer-payload-entry-title"
      >
        {$i18n.proposal_detail.payload}
        <Copy value={copyContent} />
      </h3>

      <TreeRawToggle />
    </div>

    <div class="content-cell-details">
      <JsonPreview json={payload} />
    </div>
  {:else}
    <h2
      class="content-cell-title"
      data-tid="proposal-proposer-payload-entry-title"
    >
      {$i18n.proposal_detail.payload}
    </h2>
    <div class="content-cell-details">
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  {/if}
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
