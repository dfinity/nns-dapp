<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { expandObject, getObjMaxDepth } from "$lib/utils/utils";
  import { isNullish } from "@dfinity/utils";
  import { IconExpandAll, IconExpandMore } from "@dfinity/gix-components";
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
  let isAllExpanded: boolean | undefined = undefined;
  $: isAllExpanded = false;

  let isExpandedAllVisible = false;
  $: isExpandedAllVisible =
    getObjMaxDepth(expandedData) > DEFAULT_EXPANDED_LEVEL;
  const toggleExpanded = () => {
    isAllExpanded = !isAllExpanded;
  };
</script>

<div class="content-cell-island markdown-container">
  {#if $jsonRepresentationModeStore === "tree"}
    <div class="json" data-tid="json-wrapper" in:fade>
      {#if isExpandedAllVisible}
        <button
          class="ghost expand-all"
          class:expand-all--expanded={isAllExpanded}
          on:click={toggleExpanded}
          ><IconExpandMore /><span class="expand-all-label"
            >{isAllExpanded
              ? $i18n.core.collapse_all
              : $i18n.core.expand_all}</span
          ></button
        >
      {/if}
      <TreeJson
        json={expandedData}
        defaultExpandedLevel={isAllExpanded
          ? Number.MAX_SAFE_INTEGER
          : DEFAULT_EXPANDED_LEVEL}
      />
    </div>
  {:else}
    <div in:fade>
      <RawJson {json} />
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .expand-all {
    padding: 0;
    position: absolute;
    right: var(--padding-0_5x);
    top: var(--padding-0_5x);

    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);

    .expand-all-label {
      display: none;

      @include media.min-width(small) {
        display: initial;
      }
    }

    :global(svg) {
      transform: rotate(-90deg);
      transition: transform ease-out var(--animation-time-normal);
    }

    &--expanded {
      :global(svg) {
        transform: rotate(0);
      }
    }
  }

  .json {
    // needs for the expand all button
    position: relative;
    word-break: break-word;
  }

  // TODO(max): rename and move to gix-components
  .markdown-container {
    // custom island styles
    background: var(--card-background-disabled);
    color: var(--description-color);
  }
</style>
