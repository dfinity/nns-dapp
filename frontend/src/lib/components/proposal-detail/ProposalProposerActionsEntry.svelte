<script lang="ts">
  import {
    proposalActionFields,
    proposalFirstActionKey,
  } from "../../utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import Json from "../common/Json.svelte";
  import KeyValuePair from "../ui/KeyValuePair.svelte";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    (proposal !== undefined && proposalActionFields(proposal)) || [];
</script>

<h2 class="content-cell-title" data-tid="proposal-proposer-actions-entry-title">
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
