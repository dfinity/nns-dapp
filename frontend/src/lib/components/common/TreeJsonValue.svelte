<script lang="ts">
  import { Html } from "@dfinity/gix-components";
  import type { TreeJsonValueType } from "$lib/utils/json.utils";
  import { splitE8sIntoChunks, stringifyJson } from "$lib/utils/utils.js";
  import { i18n } from "$lib/stores/i18n";

  // To avoid having quotes around all the value types
  const formatE8s = (data: unknown): string[] =>
    splitE8sIntoChunks((data as Record<"e8s", unknown>)?.e8s);
  const formatData = (value: unknown): string => {
    if (valueType === "base64Encoding") {
      return (data as { [key: string]: unknown })["base64Encoding"] as string;
    }
    if (valueType === "basisPoints") {
      return `${data.basisPoints}`;
    }
    if (valueType === "seconds") {
      return `${data.seconds}`;
    }
    if (
      (
        [
          "undefined",
          "null",
          "number",
          "bigint",
          "boolean",
          "object",
        ] as Array<TreeJsonValueType>
      ).includes(valueType)
    ) {
      return `${value}`;
    }
    // more reliable (functions etc), but adds quotes
    return stringifyJson(value);
  };

  export let data: unknown | undefined = undefined;
  export let key: string | undefined = undefined;
  export let valueType: TreeJsonValueType;

  let value: string | undefined;
  $: value = formatData(data);

  let title: string | undefined;
  $: title = valueType === "hash" ? (data as number[]).join() : undefined;
</script>

{#if valueType === "base64Encoding"}
  <!-- base64 encoded image (use <Html> to sanitize the content from XSS) -->
  <Html
    text={`<img class="value ${valueType}" alt="${key}" src="${value}" loading="lazy" />`}
  />
{:else if valueType === "seconds"}
  <span class="value {valueType}" {title}
    >{value}
    <span class="unit">{$i18n.proposal_detail.json_unit_seconds}</span>
  </span>
{:else if valueType === "e8s"}
  <span class="value {valueType}" {title}>
    {#each formatE8s(data) as chunk}
      <span>{chunk}</span>
    {/each}
    <span class="unit">{$i18n.proposal_detail.json_unit_e8s}</span>
  </span>
{:else if valueType === "basisPoints"}
  <span class="value {valueType}" {title}
    >{value}
    <span class="unit">{$i18n.proposal_detail.json_unit_basis_points}</span
    ></span
  >
{:else}
  <span class="value {valueType}" {title}>{value}</span>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .value {
    color: var(--description-color);

    // for chunks and units
    display: inline-flex;
    align-items: center;
    gap: var(--padding-0_5x);

    // keep lines (scroll horizontally)
    white-space: nowrap;

    .unit {
      margin-left: var(--padding-0_5x);
      @include fonts.small(false);
    }
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
