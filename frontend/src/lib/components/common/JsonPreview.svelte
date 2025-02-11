<script lang="ts">
  import RawJson from "$lib/components/common/RawJson.svelte";
  import TreeJson from "$lib/components/common/TreeJson.svelte";
  import { jsonRepresentationModeStore } from "$lib/derived/json-representation.derived";
  import { i18n } from "$lib/stores/i18n";
  import { expandObject, getObjMaxDepth } from "$lib/utils/utils";
  import {
    IconCollapseAll,
    IconExpandAll,
    testSafeFade,
  } from "@dfinity/gix-components";
  import { isNullish } from "@dfinity/utils";

  const DEFAULT_EXPANDED_LEVEL = 1;

  export let json: unknown | undefined = undefined;

  let expandedData: unknown;
  $: expandedData = isNullish(json)
    ? json
    : expandObject(json as Record<string, unknown>);

  let isExpandedAllVisible = false;
  $: isExpandedAllVisible =
    getObjMaxDepth(expandedData) > DEFAULT_EXPANDED_LEVEL;

  let isAllExpanded: boolean | undefined = undefined;
  const toggleExpanded = () => {
    isAllExpanded = !isAllExpanded;
  };
</script>

<div
  class="content-cell-island__card container"
  data-tid="json-preview-component"
>
  {#if $jsonRepresentationModeStore === "tree" && isExpandedAllVisible}
    <button
      data-tid="expand-tree"
      class="ghost expand-all"
      on:click={toggleExpanded}
    >
      {#if isAllExpanded}
        <div in:testSafeFade>
          <IconCollapseAll />
          <span class="expand-all-label">{$i18n.core.collapse_all}</span>
        </div>
      {:else}
        <div in:testSafeFade>
          <IconExpandAll />
          <span class="expand-all-label">{$i18n.core.expand_all}</span>
        </div>
      {/if}
    </button>
  {/if}
  <div data-tid="json-wrapper" class="json-wrapper">
    {#if $jsonRepresentationModeStore === "tree"}
      <div in:testSafeFade>
        <TreeJson
          testId="tree-json"
          json={expandedData}
          defaultExpandedLevel={isAllExpanded ? Number.MAX_SAFE_INTEGER : 1}
        />
      </div>
    {:else}
      <div in:testSafeFade>
        <RawJson testId="raw-json" {json} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    // reset "content-cell-island" padding
    padding: 0;
    // to place expand-all button
    position: relative;
  }

  .expand-all {
    padding: 0;
    position: absolute;
    right: var(--padding-2x);
    top: var(--padding-2x);

    div {
      display: flex;
      align-items: center;
      gap: var(--padding-0_5x);
    }

    .expand-all-label {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  .json-wrapper {
    // json content scrolling
    overflow-x: auto;
    // same as "content-cell-island"
    padding: var(--padding-2x);
  }
</style>
