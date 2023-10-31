<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { isHash, stringifyJson } from "$lib/utils/utils";
  import { isPrincipal } from "$lib/utils/utils";
  import { Html, IconExpandMore } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let json: unknown | undefined = undefined;
  export let defaultExpandedLevel = Infinity;
  export let _key: string | undefined = undefined;
  export let _level = 0;
  export let _collapsed: boolean | undefined = undefined;
  export let displaySyntax = false;

  type ValueType =
    | "bigint"
    | "boolean"
    | "function"
    | "null"
    | "number"
    | "object"
    | "principal"
    | "hash"
    | "string"
    | "symbol"
    | "base64Encoding"
    | "undefined";
  const notFlatArrayTypes: ValueType[] = ["object", "array"];
  const getValueType = (value: unknown): ValueType => {
    if (value === null) return "null";
    if (isPrincipal(value)) return "principal";
    if (Array.isArray(json) && isHash(json)) return "hash";
    // not null was already checked above
    if (
      typeof value === "object" &&
      Object.keys(value as object)[0] === "base64Encoding"
    )
      return "base64Encoding";
    return typeof value;
  };

  let valueType: ValueType;
  let value: unknown;
  let keyLabel: string;
  let children: [string, unknown][];
  let hasChildren: boolean;
  let isExpandable: boolean;
  let isArray: boolean;
  let isFlatArray: boolean;
  let openBracket: string;
  let closeBracket: string;
  let root: boolean;
  let testId: "json" | undefined;
  let t = Date.now();
  $: {
    valueType = getValueType(json);
    isExpandable = valueType === "object";
    value = isExpandable
      ? json
      : valueType === "base64Encoding"
      ? (json as { [key: string]: unknown })["base64Encoding"]
      : stringifyJson(json);
    keyLabel = `${_key ?? ""}${displaySyntax && nonNullish(_key) ? ": " : ""}`;
    children = isExpandable ? Object.entries(json as object) : [];
    hasChildren = children.length > 0;
    isArray = Array.isArray(json);
    isFlatArray =
      Array.isArray(json) &&
      json.every((v) => !notFlatArrayTypes.includes(getValueType(v)));
    openBracket = isArray ? "[" : "{";
    closeBracket = isArray ? "]" : "}";
    root = _level === 0;
    testId = root ? "json" : undefined;
  }

  let title: string | undefined;
  $: title = valueType === "hash" ? (json as number[]).join() : undefined;

  let collapsed = true;
  $: collapsed =
    _collapsed === undefined ? _level >= defaultExpandedLevel : _collapsed;

  let keyIsIndex = false;
  $: keyIsIndex = !isNaN(Number(_key));

  const toggle = () => (collapsed = !collapsed);
</script>

{#if isExpandable && hasChildren}
  <!-- ignore first level object syntax-->
  {#if _level > 0 && keyLabel}
    <!-- expandable-key-->
    <div
      class="key key--expandable"
      class:root={_level === 1}
      class:key--is-index={keyIsIndex}
    >
      <button
        class="icon-only"
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
    <ul class:root class:is-array={isArray} class:flat-array={isFlatArray}>
      {#each children as [key, value]}
        <li class:root>
          <svelte:self
            json={value}
            _key={key}
            {defaultExpandedLevel}
            _level={_level + 1}
          />
        </li>
      {/each}
    </ul>
  {/if}
{:else if isExpandable}
  <!-- expandable w/o children - key+{}|[] -->
  <span data-tid={testId} class="key-value">
    {#if keyLabel !== ""}<span
        class="key key--no-expand-button"
        class:root={_level === 1}
        class:key--is-index={keyIsIndex}>{keyLabel}</span
      >{/if}
    <span class="value bracket" {title}>{openBracket} {closeBracket}</span>
  </span>
{:else if valueType === "base64Encoding"}
  <!-- base64 encoded image (use <Html> to sanitize the content from XSS) -->
  <span data-tid={testId} class="key-value" class:root={_level === 1}>
    {#if keyLabel !== ""}<span
        class="key"
        class:root={_level === 1}
        class:key--is-index={keyIsIndex}>{keyLabel}</span
      >{/if}<Html
      text={`<img class="value ${valueType}" alt="${_key}" src="${value}" />`}
    /></span
  >
{:else}
  <!-- non-expandable key+value -->
  <span data-tid={testId} class="key-value" class:root={_level === 1}>
    {#if keyLabel !== ""}<span
        class="key key--no-expand-button"
        class:root={_level === 1}
        class:key--is-index={keyIsIndex}>{keyLabel}</span
      >{/if}
    <span class="value {valueType}" {title} class:root={_level === 0}
      >{value}</span
    >
  </span>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";
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

    // To have at least the same height as IconExpandMore
    min-height: 28px;
    // icon gap compensation
    margin-left: 6px;
  }

  .key {
    display: flex;
    align-items: center;
    margin-right: var(--padding-2x);

    @include fonts.standard(true);
    color: var(--content-color);

    &.root {
      @include fonts.h4();
    }
    &.key--expandable {
      margin-right: 0;
      // no icon gap compensation
      margin-left: 0;
    }
    &.key--is-index {
      // monospace for array indexes to avoid different widths
      font-family: monospace;
    }
  }

  .value {
    // better shrink the value than the key
    flex: 1 1 0;
    // We want to break the value, so that the keys stay on the same line.
    word-break: break-all;
    color: var(--description-color);
  }

  // base64 encoded image
  :global(.value.base64Encoding) {
    vertical-align: top;
    max-width: var(--padding-3x);
    overflow: hidden;
    transition: max-width ease-out var(--animation-time-normal);

    // increase size on hover (128px max size)
    &:hover {
      max-width: calc(16 * var(--padding));
    }
  }
</style>
