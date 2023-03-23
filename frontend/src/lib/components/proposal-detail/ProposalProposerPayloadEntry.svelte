<script lang="ts">
  import Json from "../common/Json.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import { expandObject } from "$lib/utils/utils";
  import { isNullish } from "@dfinity/utils";

  // `undefined` means that the payload is not loaded yet
  // `null` means that the payload was not found
  // `object` means that the payload is an object
  export let payload: object | undefined | null;
  let expandedPayload: object | undefined | null;
  $: expandedPayload = isNullish(payload)
    ? payload
    : expandObject(payload as Record<string, unknown>);
</script>

<div class="content-cell-island">
  <h2
    class="content-cell-title"
    data-tid="proposal-proposer-payload-entry-title"
  >
    {$i18n.proposal_detail.payload}
  </h2>

  <div class="content-cell-details">
    <!-- `null` payload should be shown as `null` -->
    {#if expandedPayload !== undefined}
      <div class="json" data-tid="json-wrapper">
        <Json json={expandedPayload} />
      </div>
    {:else}
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    {/if}
  </div>
</div>

<style lang="scss">
  .json {
    word-break: break-word;
  }
</style>
