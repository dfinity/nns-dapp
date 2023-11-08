<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { expandObject, getObjMaxDepth } from "$lib/utils/utils";
  import { isNullish } from "@dfinity/utils";
  import { IconExpandAll } from "@dfinity/gix-components";
  import TreeJson from "$lib/components/common/TreeJson.svelte";
  import RawJson from "$lib/components/common/RawJson.svelte";
  import { fade } from "svelte/transition";
  import { jsonRepresentationModeStore } from "$lib/derived/json-representation.derived";

  export let json: unknown | undefined = undefined;

  let expandedData: unknown;
  $: expandedData = isNullish(json)
    ? json
    : expandObject(json as Record<string, unknown>);

  const DEFAULT_EXPANDED_LEVEL = 1;
  let expandAll = false;
  $: expandAll =
    getObjMaxDepth(expandedData) <= DEFAULT_EXPANDED_LEVEL ? true : expandAll;
  const toggleExpanded = () => (expandAll = !expandAll);
</script>

<div class="content-cell-island markdown-container">
  {#if $jsonRepresentationModeStore === "tree" && !expandAll}
    <button class="ghost expand-all" on:click={toggleExpanded}
      ><IconExpandAll /><span class="expand-all-label"
        >{$i18n.core.expand_all}</span
      ></button
    >
  {/if}
  <div class="json-container">
    <div class="json" data-tid="json-wrapper" in:fade>
      {#if $jsonRepresentationModeStore === "tree"}
        <TreeJson
          json={expandedData}
          defaultExpandedLevel={expandAll ? Number.MAX_SAFE_INTEGER : 1}
        />
      {:else}
        <div in:fade>
          <RawJson {json} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .expand-all {
    padding: 0;
    position: absolute;
    right: var(--padding-2x);
    top: var(--padding-2x);

    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .expand-all-label {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }
  }

  .json-container {
    // json content scrolling
    overflow-x: auto;
    // same as "content-cell-island"
    padding: var(--padding-2x);
  }

  // TODO(max): rename and move to gix-components
  .markdown-container {
    // custom island styles
    background: var(--card-background-disabled);
    color: var(--description-color);

    // reset "content-cell-island" padding
    padding: 0;
    // to place expand-all button
    position: relative;
  }
</style>
