<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { expandObject, getObjMaxDepth } from "$lib/utils/utils";
  import { isNullish } from "@dfinity/utils";
  import { jsonRepresentationModeStore } from "$lib/stores/json-representation-mode.store";
  import { IconExpandAll, SkeletonText } from "@dfinity/gix-components";
  import PrettyJson from "$lib/components/common/PrettyJson.svelte";
  import RawJson from "$lib/components/common/RawJson.svelte";

  export let json: unknown | undefined = undefined;

  let expandedData: object | undefined | null;
  $: expandedData = isNullish(json)
    ? json
    : (expandObject(json as Record<string, unknown>) as object);

  let maxDeep = 0;
  $: maxDeep = getObjMaxDepth(expandedData);

  let expandAll: boolean = false;
  $: expandAll = maxDeep < 2 ? true : expandAll;
  const toggleExpanded = () => (expandAll = !expandAll);

  $: console.log(expandedData);
</script>

<div class="content-cell-island markdown-container">
  {#if json !== undefined}
    {#if $jsonRepresentationModeStore === "pretty"}
      <div class="json" data-tid="json-wrapper">
        {#if !expandAll}
          <button
            disabled={expandAll ? "disabled" : undefined}
            class="ghost expand-all"
            on:click={toggleExpanded}
            ><IconExpandAll /><span class="expand-all-label"
              >{$i18n.core.expand_all}</span
            ></button
          >
        {/if}
        <PrettyJson
          json={expandedData}
          defaultExpandedLevel={expandAll ? Number.MAX_SAFE_INTEGER : 1}
        />
      </div>
    {:else}
      <RawJson {json} />
    {/if}
  {:else}
    <SkeletonText />
    <SkeletonText />
    <SkeletonText />
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
