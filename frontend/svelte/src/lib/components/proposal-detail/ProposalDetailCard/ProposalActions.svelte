<script lang="ts">
  import type { Proposal } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import {
    proposalFirstActionKey,
    proposalActionFields,
  } from "../../../../lib/utils/proposals.utils";
  import JSONTree from "svelte-json-tree";
  import { stringifyJson } from "../../../utils/utils";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    (proposal !== undefined && proposalActionFields(proposal)) || [];
</script>

<CardBlock>
  <svelte:fragment slot="title">{actionKey}</svelte:fragment>
  <ul>
    {#each actionFields as [key, value]}
      <li>
        <h4>{key}</h4>
        {#if typeof value === "object"}
          <p class="json">
            <JSONTree
              defaultExpandedLevel={0}
              value={JSON.parse(stringifyJson(value))}
            />
          </p>
        {:else}
          <p>
            {value}
          </p>
        {/if}
      </li>
    {/each}
  </ul>
</CardBlock>

<style lang="scss">
  @use "../../../themes/mixins/media";

  :global(.json) {
    --json-tree-font-size: var(--font-size-small);
    // --json-tree-font-family: "Circular", sans-serif;
    --json-tree-li-indentation: var(--padding);
    --json-tree-li-line-height: var(--line-height-standard);
    // colors
    --json-tree-property-color: var(--gray-200);
    --json-tree-string-color: var(--yellow-400);
    --json-tree-symbol-color: var(--gray-200);
    --json-tree-boolean-color: var(--blue-200);
    --json-tree-function-color: var(--blue-200);
    --json-tree-number-color: var(--blue-200);
    --json-tree-label-color: var(--gray-200);
    --json-tree-property-color: var(--background-contrast);
    --json-tree-arrow-color: var(--blue-500);
    --json-tree-operator-color: var(--gray-200);
    --json-tree-null-color: var(--gray-100);
    --json-tree-undefined-color: var(--gray-100);
    --json-tree-date-color: var(--gray-100);
    --json-tree-internal-color: var(--gray-100);
    --json-tree-regex-color: var(--yellow-400);
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      margin-bottom: var(--padding);

      h4 {
        font-size: var(--font-size-ultra-small);
        color: var(--background-contrast);
        line-height: 1;

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
      p {
        font-size: var(--font-size-ultra-small);
        color: var(--gray-100);
        overflow-wrap: break-word;
        white-space: pre-wrap;

        @include media.min-width(medium) {
          font-size: var(--font-size-small);
        }
      }
    }
  }
</style>
