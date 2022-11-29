<script lang="ts">
  import {
    proposalActionFields,
    proposalFirstActionKey,
  } from "$lib/utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import Json from "../common/Json.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    proposal !== undefined ? proposalActionFields(proposal) : [];
</script>

<div class="content-cell-island">
  <h2
    class="content-cell-title"
    data-tid="proposal-proposer-actions-entry-title"
  >
    {actionKey ?? ""}
  </h2>

  <div class="content-cell-details">
    {#each actionFields as [key, value]}
      <KeyValuePair>
        <span slot="key">{key}</span>
        <span class="value" slot="value">
          {#if typeof value === "object"}
            <Json json={value} />
          {:else}
            {value}
          {/if}
        </span>
      </KeyValuePair>
    {/each}
  </div>
</div>

<style lang="scss">
  .content-cell-island {
    margin-top: var(--row-gap);
  }
</style>
