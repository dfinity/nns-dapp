<script lang="ts">
  import Json from "../common/Json.svelte";
  import { i18n } from "$lib/stores/i18n";
  import {
    Copy,
    IconExpandCircleDown,
    SkeletonText,
  } from "@dfinity/gix-components";
  import { expandObject, stringifyJson } from "$lib/utils/utils";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import TreeRawToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
  import { type Writable, writable } from "svelte/store";
  import { jsonRepresentationModeStore } from "$lib/stores/json-representation-mode.store";

  // `undefined` means that the payload is not loaded yet
  // `null` means that the payload was not found
  // `object` means that the payload is an object
  export let payload: object | undefined | null;
  let expandedPayload: object | undefined | null;
  $: expandedPayload = isNullish(payload)
    ? payload
    : expandObject(payload as Record<string, unknown>);

  let rawContent: string | undefined | null;
  $: rawContent = nonNullish(payload)
    ? stringifyJson(payload, { indentation: 2 })
    : payload;

  let expanded: boolean = false;
  const toggleExpanded = () => (expanded = !expanded);
</script>

<div class="content-cell-island">
  <div class="header">
    <h2
      class="content-cell-title header-text"
      data-tid="proposal-proposer-payload-entry-title"
    >
      {$i18n.proposal_detail.payload}
      <Copy value={rawContent ?? ""} />
    </h2>

    <TreeRawToggle />
  </div>

  <div class="content-cell-details">
    <div class="content-cell-island markdown-container">
      <!-- TODO(Max): create a component for pretty vs raw renderer -->
      {#if expandedPayload !== undefined}
        {#if $jsonRepresentationModeStore === "pretty"}
          <div class="json" data-tid="json-wrapper">
            <button
              disabled={expanded ? "disabled" : undefined}
              class="ghost expand-all"
              on:click={toggleExpanded}><IconExpandCircleDown />All</button
            >
            <Json
              json={expandedPayload}
              defaultExpandedLevel={expanded ? undefined : 1}
            />
          </div>
        {:else}
          <pre>{rawContent}</pre>
        {/if}
      {:else}
        <SkeletonText />
        <SkeletonText />
        <SkeletonText />
      {/if}
    </div>
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

  .expand-all {
    position: absolute;
    right: var(--padding-0_5x);
    top: var(--padding-0_5x);
    display: flex;
    align-items: center;
    gap: var(--padding-0_5x);
    padding: var(--padding-0_5x);
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

  pre {
    overflow-x: auto;
  }
</style>
