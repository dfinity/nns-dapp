<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExpandMore } from "@dfinity/gix-components";
  import TreeJsonValue from "$lib/components/common/TreeJsonValue.svelte";
  import {
    getTreeJsonValueRenderType,
    type TreeJsonValueType,
  } from "$lib/utils/json.utils";
  import { fade } from "svelte/transition";
  import { typeOfLikeANumber } from "$lib/utils/utils";

  export let json: unknown | undefined = undefined;
  export let defaultExpandedLevel = Infinity;
  export let _key: string | undefined = undefined;
  export let _level = 0;
  // because the child doesn't know if its parent type
  export let _isArrayEntry: boolean | undefined = undefined;

  let keyLabel: string;
  let children: [string, unknown][];
  let hasChildren: boolean;
  let isExpandable: boolean;
  let isArray: boolean;
  let emptyExpandableValue: "{ }" | "[ ]";
  let root: boolean;
  let keyRoot: boolean;
  let testId: "json" | undefined;
  let valueType: TreeJsonValueType;
  $: {
    valueType = getTreeJsonValueRenderType(json);
    isExpandable = valueType === "object";
    keyLabel = `${_key ?? ""}`;
    children = isExpandable ? Object.entries(json as object) : [];
    hasChildren = children.length > 0;
    isArray = Array.isArray(json);
    emptyExpandableValue = isArray ? "[ ]" : "{ }";
    root = _level === 0;
    // ignore 0 level wrapper
    keyRoot = _level <= 1;
    testId = root ? "json" : undefined;
  }

  let collapsed = true;
  $: collapsed = _level >= defaultExpandedLevel;

  let keyIsIndex = false;
  $: keyIsIndex = typeOfLikeANumber(_key) || (_isArrayEntry ?? false);

  const toggle = () => (collapsed = !collapsed);
</script>

{#if isExpandable && hasChildren}
  <!-- ignore first level object syntax-->
  {#if _level > 0 && keyLabel}
    <!-- expandable-key-->
    <div
      class="key expandable"
      class:root={keyRoot}
      class:key-is-index={keyIsIndex}
    >
      <button
        class="icon-only expand-button"
        class:is-expandable={!collapsed}
        data-tid={testId}
        aria-label={$i18n.core.toggle}
        tabindex="0"
        on:click|stopPropagation={toggle}
      >
        <IconExpandMore />
      </button>
      {keyLabel}
    </div>
  {/if}
  {#if !collapsed}
    <!-- children of expandable-key -->
    <ul class:root class:is-array={isArray} in:fade>
      {#each children as [key, value]}
        <li class:root class:key-is-index={keyIsIndex}>
          <svelte:self
            json={value}
            _key={key}
            {defaultExpandedLevel}
            _level={_level + 1}
            _isArrayEntry={isArray}
          />
        </li>
      {/each}
    </ul>
  {/if}
{:else if isExpandable}
  <!-- expandable w/o children - key+{}|[] -->
  <span data-tid={testId} class="key-value" class:key-is-index={keyIsIndex}>
    {#if keyLabel !== ""}<span
        class="key"
        class:root={keyRoot}
        class:key-is-index={_isArrayEntry}>{keyLabel}</span
      >{/if}
    <span class="value">{emptyExpandableValue}</span>
  </span>
{:else}
  <!-- key+value -->
  <span class={`key-value ${valueType}`} class:key-is-index={keyIsIndex}>
    {#if keyLabel !== ""}
      <span class="key" class:key-is-index={keyIsIndex} class:root={keyRoot}>
        {keyLabel}
      </span>{/if}
    <TreeJsonValue data={json} key={_key} {valueType} />
  </span>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  ul {
    list-style: none;
    margin: 0;
    // space between deep levels
    padding: 0 0 0 var(--padding-3x);

    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);

    &.root {
      margin: 0;
      padding: 0;
    }
  }

  // key-value entry wrapper
  .key-value {
    display: flex;
    align-items: center;

    // To improve long lines mobile readability
    flex-wrap: wrap;
    row-gap: calc(var(--padding-0_5x) / 2);

    // To have at least the same height as IconExpandMore
    min-height: 28px;
    // icon gap compensation
    margin-left: 6px;

    // don't wrap array entries because keys are short (`0: "..."`)
    &.key-is-index {
      flex-wrap: nowrap;
    }
    // don't wrap images because of broken zoom animation
    &.base64Encoding {
      flex-wrap: nowrap;
    }
  }

  .key {
    display: flex;
    align-items: center;
    margin-right: var(--padding-2x);

    @include fonts.standard(true);
    color: var(--content-color);

    &.expandable {
      margin-right: 0;
      // no icon gap compensation
      margin-left: 0;
    }
    &.key-is-index {
      // monospace for array indexes to avoid different widths
      font-family: monospace;
    }
  }

  .expand-button {
    transform: rotate(-90deg);
    transition: transform ease-out var(--animation-time-normal);

    &.is-expandable {
      transform: rotate(0);
    }
  }
</style>
