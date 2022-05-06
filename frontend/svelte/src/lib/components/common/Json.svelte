<script lang="ts">
  import { i18n } from "../../stores/i18n";
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
    | "string"
    | "symbol"
    | "undefined";
  const valueType = (value): ValueType => {
    if (value === null) return "null";
    if (isPrincipal(value)) return "principal";
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

  let keyLabel: string;
  let children: [string, unknown][];
  let hasChildren: boolean;
  let isExpandable: boolean;
  let isArray: boolean;
  let openBracket: string;
  let closeBracket: string;
  $: {
    isExpandable = valueType(json) === "object";
    keyLabel = `${_key}${_key.length > 0 ? ": " : ""}`;
    children = isExpandable ? Object.entries(json as object) : [];
    hasChildren = children.length > 0;
    isExpandable = valueType(json) === "object";
    isArray = Array.isArray(json);
    openBracket = isArray ? "[" : "{";
    closeBracket = isArray ? "]" : "}";
  }

  let collapsed: boolean = true;
  $: collapsed =
    _collapsed === undefined ? defaultExpandedLevel < _level : _collapsed;

  const toggle = () => (collapsed = !collapsed);
</script>

{#if isExpandable && hasChildren}
  {#if collapsed}
    <span
      class="key"
      class:expanded={!collapsed}
      class:collapsed
      class:root={_level === 1}
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
      class="key"
      class:expanded={!collapsed}
      class:collapsed
      class:root={_level === 1}
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
  <span class="key" class:root={_level === 1}
    >{keyLabel}<span class="bracket">{openBracket} {closeBracket}</span></span
  >
{:else}
  <!-- key:value -->
  <span class="key-value">
    <span class="key" class:root={_level === 1}>{keyLabel}</span><span
      class="value {valueType(json)}">{stringify(json)}</span
    ></span
  >
{/if}

<style lang="scss">
  @use "../../themes/mixins/interaction";

  .root,
  .root + ul {
    // first arrow extra space
    margin-left: var(--padding-1_5x);
  }
  ul {
    // reset
    margin: 0;
    padding: 0;

    padding-left: var(--padding);
    list-style: none;
    color: var(--gray-100);
  }
  .key {
    display: inline-block;
    position: relative;
  }
  .key-value {
    // word-wrap long values in it's column
    display: inline-flex;
  }
  .arrow {
    @include interaction.tappable;
    // increase click area
    padding: calc(0.25 * var(--padding));
    min-width: var(--padding);

    display: inline-block;
    position: relative;
    border-radius: var(--padding-0_5x);

    &:hover {
      color: var(--blue-500-contrast);
      background: var(--blue-500);
      &::before {
        color: var(--blue-500);
      }
      .bracket {
        color: var(--blue-500-contrast);
      }
    }

    &::before {
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;
      transform: translate(
        calc(-1 * var(--padding-1_5x)),
        calc(0.6 * var(--padding))
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

  // value type colors
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
  .value.bigint {
    color: var(--json-bigint-color);
  }
  .value.boolean {
    color: var(--json-boolean-color);
  }
</style>
