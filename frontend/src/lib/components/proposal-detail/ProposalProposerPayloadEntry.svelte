<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Copy, SkeletonText } from "@dfinity/gix-components";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import JsonPreview from "$lib/components/common/JsonPreview.svelte";
  import { expandObject, stringifyJson } from "$lib/utils/utils";
  import { isNullish } from "@dfinity/utils";
  import { ENABLE_FULL_WIDTH_PROPOSAL } from "$lib/stores/feature-flags.store";
  import Json from "$lib/components/common/Json.svelte";

  // `undefined` means that the payload is not loaded yet
  // `null` means that the payload was not found
  // `object` means that the payload is an object
  export let payload: object | undefined | null;

  let expandedPayload: unknown;
  $: expandedPayload = isNullish(payload)
    ? payload
    : expandObject(payload as Record<string, unknown>);

  let copyContent = "";
  $: copyContent = stringifyJson(payload, { indentation: 2 }) ?? "";
</script>

<div class="content-cell-island">
  {#if expandedPayload !== undefined}
    {#if $ENABLE_FULL_WIDTH_PROPOSAL}
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
    {:else}
      <h2
        class="content-cell-title"
        data-tid="proposal-proposer-payload-entry-title"
      >
        {$i18n.proposal_detail.payload}
      </h2>
      <div class="content-cell-details">
        <!-- `null` payload should be shown as `null` -->
        <div class="json" data-tid="json-wrapper">
          <Json json={expandedPayload} />
        </div>
      </div>
    {/if}
  {:else}
    <div class="content-cell-details">
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </div>
  {/if}
</div>

<style lang="scss">
  // TODO(max): remove after flag is removed
  .json {
    word-break: break-word;
  }

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
