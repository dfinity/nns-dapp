<script lang="ts">
  import Json from "../common/Json.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { SkeletonText } from "@dfinity/gix-components";
  import { expandObject, isNullish } from "$lib/utils/utils";

  export let payload: object | undefined | null;
  let expandedPayload: object | undefined | null;
  $: expandedPayload = isNullish(payload)
    ? payload
    : expandObject(payload as Record<string, unknown>);
</script>

{#if payload !== undefined && payload !== null}
  <div class="content-cell-island">
    <h2
      class="content-cell-title"
      data-tid="proposal-proposer-payload-entry-title"
    >
      {$i18n.proposal_detail.payload}
    </h2>

    <div class="content-cell-details">
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
{/if}

<style lang="scss">
  .content-cell-island {
    margin-top: var(--row-gap);
  }

  .json {
    word-break: break-word;
  }
</style>
