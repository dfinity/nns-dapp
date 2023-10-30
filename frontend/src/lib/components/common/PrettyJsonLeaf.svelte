<script lang="ts">
  import { isHash, stringifyJson } from "$lib/utils/utils";
  import { isPrincipal } from "$lib/utils/utils";
  import { Html } from "@dfinity/gix-components";

  export let json: unknown | undefined = undefined;

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
  $: valueType = getValueType(json);

  let value: unknown;
  $: value =
    valueType === "base64Encoding"
      ? (json as { [key: string]: unknown })["base64Encoding"]
      : stringifyJson(json);

  let title: string | undefined;
  $: title = valueType === "hash" ? (json as number[]).join() : undefined;
</script>

<span data-tid="pretty-json-value" class="value {valueType}">
  {#if valueType === "base64Encoding"}
    <!-- base64 encoded image (use <Html> to sanitize the content from XSS) -->
    <Html
      text={`<img class="value ${valueType}" src="${value}" alt={title} {title} />`}
    />
  {:else}{value}{/if}
</span>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/interaction";

  .value {
    // Values can be strings of JSON and long. We want to break the value, so that the keys stay on the same line.
    word-break: break-all;
  }

  // value types
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
    color: var(--json-hash-color);
  }
  .value.bigint {
    color: var(--json-bigint-color);
  }
  .value.boolean {
    color: var(--json-boolean-color);
  }
  :global(.value.base64Encoding) {
    vertical-align: top;
  }
</style>
