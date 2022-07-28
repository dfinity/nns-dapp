<script lang="ts">
  import { i18n } from "../../stores/i18n";
  import { bytesToHexString, isHash } from "../../utils/utils";
  import { isPrincipal } from "../../utils/utils";

  export let json: unknown | undefined = undefined;
  export let defaultExpandedLevel: number = Infinity;
  export let _key: string = "";
  export let _level: number = 1;
  export let _collapsed: boolean | undefined = undefined;

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
    | "undefined";
  const getValueType = (value: unknown): ValueType => {
    if (value === null) return "null";
    if (isPrincipal(value)) return "principal";
    if (Array.isArray(json) && isHash(json)) return "hash";
    return typeof value;
  };
  const stringify = (value: unknown): string | object => {
    switch (typeof value) {
      case "object": {
        if (value === null) {
          return "null";
        }
        // Represent Principals as strings rather than as byte arrays when serializing to JSON strings
        if (isPrincipal(value)) {
          const asText = value.toString();
          if (asText !== "[object Object]") {
            // To not stringify NOT-Principal object that contains _isPrincipal field
            return `"${asText}"`;
          }
        }
        // optimistic hash stringifying
        if (Array.isArray(value) && isHash(value)) {
          return bytesToHexString(value);
        }
        return value;
      }
      case "string":
        return `"${value}"`;
      case "bigint":
        return value.toString();
      case "function":
        return "f () { ... }";
      case "symbol":
        return value.toString();
      default:
        return `${value}`;
    }
  };

  let valueType: ValueType;
  let value: unknown;
  let keyLabel: string;
  let children: [string, unknown][];
  let hasChildren: boolean;
  let isExpandable: boolean;
  let isArray: boolean;
  let openBracket: string;
  let closeBracket: string;
  let root: boolean;
  let testId: "json" | undefined;
  $: {
    valueType = getValueType(json);
    isExpandable = valueType === "object";
    value = isExpandable ? json : stringify(json);
    keyLabel = `${_key}${_key.length > 0 ? ": " : ""}`;
    children = isExpandable ? Object.entries(json as object) : [];
    hasChildren = children.length > 0;
    isArray = Array.isArray(json);
    openBracket = isArray ? "[" : "{";
    closeBracket = isArray ? "]" : "}";
    root = _level === 1;
    testId = root ? "json" : undefined;
  }

  let title: string | undefined;
  $: title = valueType === "hash" ? (json as number[]).join() : undefined;

  let collapsed: boolean = true;
  $: collapsed =
    _collapsed === undefined ? defaultExpandedLevel < _level : _collapsed;

  const toggle = () => (collapsed = !collapsed);
</script>

{#if isExpandable && hasChildren}
  {#if collapsed}
    <span
      data-tid={testId}
      class="key"
      class:expanded={!collapsed}
      class:collapsed
      class:root
      class:arrow={isExpandable && hasChildren}
      role="button"
      aria-label={$i18n.core.toggle}
      tabindex="0"
      on:click|stopPropagation={toggle}
      >{keyLabel}
      <span class="bracket">{openBracket} ... {closeBracket}</span>
    </span>
  {:else}
    <!-- key -->
    <span
      data-tid={testId}
      class="key"
      class:expanded={!collapsed}
      class:collapsed
      class:root
      class:arrow={isExpandable && hasChildren}
      role="button"
      aria-label={$i18n.core.toggle}
      tabindex="0"
      on:click|stopPropagation={toggle}
      >{keyLabel}<span class="bracket open">{openBracket}</span></span
    >
    <!-- children -->
    <ul>
      {#each children as [key, value]}
        <li>
          <svelte:self
            json={value}
            _key={key}
            {defaultExpandedLevel}
            _level={_level + 1}
          />
        </li>
      {/each}
    </ul>
    <span class="bracket close">{closeBracket}</span>
  {/if}
{:else if isExpandable}
  <!-- no childre -->
  <span data-tid={testId} class="key" class:root
    >{keyLabel}<span class="bracket">{openBracket} {closeBracket}</span></span
  >
{:else}
  <!-- key:value -->
  <span data-tid={testId} class="key-value">
    <span class="key" class:root>{keyLabel}</span><span
      class="value {valueType}"
      {title}>{value}</span
    ></span
  >
{/if}

<style lang="scss">
  @use "../../themes/mixins/interaction";

  .root,
  .root ~ ul,
  .root ~ span {
    // first arrow extra space
    margin-left: var(--padding-2x);
  }
  ul {
    // reset
    margin: 0;
    padding: 0 0 0 var(--padding-1_5x);
    list-style: none;
  }
  .key {
    display: inline-block;
    position: relative;

    color: var(--label-color);
  }
  .key-value {
    // word-wrap long values in it's column
    display: inline-flex;
  }
  .arrow {
    @include interaction.tappable;
    // increase click area
    padding: 0 var(--padding-0_5x);
    // compensate click area
    transform: translateX(calc(-1 * var(--padding-0_5x)));
    min-width: var(--padding);

    display: inline-block;
    position: relative;
    border-radius: var(--padding-0_5x);

    &:hover {
      color: var(--primary-contrast);
      background: var(--primary);
      &::before {
        color: var(--primary);
      }
      .bracket {
        color: var(--primary-contrast);
      }
    }

    &::before {
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(
        calc(-1 * var(--padding-1_5x)),
        calc(0.3 * var(--padding))
      );
      font-size: var(--padding);
    }
    &.expanded::before {
      content: "▼";
    }
    &.collapsed::before {
      content: "▶";
    }
  }

  // value types
  .bracket {
    color: var(--json-bracket-color);
  }
  .value {
    color: var(--json-value-color);
  }
  .value.string {
    color: var(--json-string-color);
  }
  .value.number {
    color: var(--json-number-color);
  }
  .value.null {
    color: var(--json-null-color);
  }
  .value.principal {
    color: var(--json-principal-color);
  }
  .value.hash {
    word-break: break-all;
    color: var(--json-hash-color);
  }
  .value.bigint {
    color: var(--json-bigint-color);
  }
  .value.boolean {
    color: var(--json-boolean-color);
  }
</style>
