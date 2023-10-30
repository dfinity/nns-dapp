<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Copy } from "@dfinity/gix-components";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { stringifyJson } from "$lib/utils/utils";

  // `undefined` means that the payload is not loaded yet
  // `null` means that the payload was not found
  // `object` means that the payload is an object
  export let payload: object | undefined | null;

  let copyContent = "";
  $: copyContent = stringifyJson(payload, { indentation: 2 }) ?? "";
</script>

<div class="content-cell-island">
  <div class="header">
    <h2
      class="content-cell-title header-text"
      data-tid="proposal-proposer-payload-entry-title"
    >
      {$i18n.proposal_detail.payload}
      <Copy value={copyContent} />
    </h2>

    <TreeRawToggle />
  </div>

  <div class="content-cell-details">
    <JsonPreview json={payload} />
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
