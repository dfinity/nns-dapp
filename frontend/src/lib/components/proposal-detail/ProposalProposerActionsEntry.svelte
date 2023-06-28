<script lang="ts">
  import Json from "../common/Json.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import {fromDefinedNullableRecursive} from "$lib/utils/utils";

  export let actionKey: string | undefined;
  export let actionFields: [string, unknown][] = [];

  let isOneProposal = false;
  $: isOneProposal = actionKey === "CreateServiceNervousSystem";
</script>

<div
  class="content-cell-island"
  data-tid="proposal-proposer-actions-entry-component"
>
  <h2
    class="content-cell-title"
    data-tid="proposal-proposer-actions-entry-title"
  >
    {actionKey ?? ""}
  </h2>

  <div
    class="content-cell-details"
    data-tid="proposal-proposer-actions-entry-fields"
  >
    {#each actionFields as [key, value]}
      <KeyValuePair>
        <span slot="key">{key}</span>
        <span class="value" slot="value">
          {#if typeof value === "object"}
            <Json json={isOneProposal ? fromDefinedNullableRecursive(value) : value} />
          {:else}
            {value}
          {/if}
        </span>
      </KeyValuePair>
    {/each}
  </div>
</div>

<style lang="scss">
  .content-cell-details {
    overflow-x: auto;
    // get rid of vertical scroll
    padding-bottom: 1px;
  }
</style>
