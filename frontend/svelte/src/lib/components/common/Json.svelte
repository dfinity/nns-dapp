<script lang="ts">
  import { isPrincipal } from "../../utils/utils";

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

  export let json: unknown | undefined;
  export let defaultExpandedLevel: number = Infinity;
  export let _level: number = 1;
  export let _isLastEntry: boolean = true;

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

  let keys: string[];
  let values: unknown[];
  let isArray: boolean;
  let openBracket;
  let closeBracket;
  $: {
    keys = valueType(json) === "object" ? Object.keys(json as object) : [];
    values = keys.length > 0 ? Object.values(json as object) : [];
    isArray = Array.isArray(json);
    openBracket = isArray ? "[" : "{";
    closeBracket = isArray ? "]" : "}";
  }

  let collapsed: boolean = true;
  $: collapsed = defaultExpandedLevel < _level;

  const clicked = () => {
    collapsed = !collapsed;
  };
</script>

{#if keys.length}
  {#if collapsed}
    <span
      class="bracket collapsed"
      on:click|stopPropagation={clicked}
      tabindex="0">{openBracket} ... {closeBracket}</span
    >{#if !_isLastEntry && collapsed}<span class="comma">,</span>{/if}
  {:else}
    <span class="bracket open" on:click|stopPropagation={clicked} tabindex="0"
      >{openBracket}</span
    >
    <ul>
      {#each keys as key, index}
        {@const value = values[index]}
        <li>
          {#if !isArray}
            <span class="key">{key}:</span>
          {/if}
          {#if valueType(value) === "object"}
            <svelte:self
              json={value}
              {defaultExpandedLevel}
              _level={_level + 1}
              _isLastEntry={index === keys.length - 1}
            />
          {:else}
            <span class="value {valueType(value)}"
              >{stringify(value)}{#if index < keys.length - 1}<span
                  class="comma">,</span
                >{/if}</span
            >
          {/if}
        </li>
      {/each}
    </ul>
    <span class="bracket close" on:click|stopPropagation={clicked} tabindex="0"
      >{closeBracket}</span
    >{#if !_isLastEntry}<span class="comma">,</span>{/if}
  {/if}
{:else if isArray}
  [ ]
{:else}
  {"{ }"}
{/if}

<style lang="scss">
  @use "../../themes/mixins/interaction";

  ul {
    // reset
    margin: 0;
    padding: 0;

    padding-left: var(--padding);
    list-style: none;
    color: var(--gray-100);
  }
  .bracket {
    @include interaction.tappable;
    // increase click area
    padding: calc(0.25 * var(--padding));
    min-width: var(--padding);

    display: inline-block;
    border-radius: var(--padding-0_5x);

    &::before {
      display: inline-block;
      padding-right: var(--padding);
      font-size: var(--padding);
    }
    &.open::before {
      content: "▼";
    }
    &.collapsed::before {
      content: "▶";
    }
    &.close {
      // remove due to space before comma
      min-width: 0;
    }
  }
  .bracket:hover {
    color: var(--blue-500-contrast);
    background: var(--blue-500);
  }
  .comma {
    color: var(--gray-200);
  }
  .value {
    color: var(--gray-100);
  }
  .value.string {
    color: var(--yellow-400);
  }
  .value.number {
    color: var(--blue-200-shade);
  }
  .value.null {
    color: var(--blue-200-shade);
  }
  .value.principal {
    color: var(--yellow-400);
  }
  .value.bigint {
    color: var(--blue-200-shade);
  }
  .value.boolean {
    color: var(--background-contrast);
  }
</style>
