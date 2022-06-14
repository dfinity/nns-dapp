<script lang="ts">
  import type { Proposal, ProposalId } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import {
    proposalFirstActionKey,
    proposalActionFields,
    getNnsFunctionId,
  } from "../../../../lib/utils/proposals.utils";
  import Json from "../../common/Json.svelte";
  import NnsFunctionDetails from "./NnsFunctionDetails.svelte";

  export let proposalId: ProposalId;
  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    (proposal !== undefined && proposalActionFields(proposal)) || [];

  let nnsFunctionId: number | undefined;
  $: nnsFunctionId = proposal && getNnsFunctionId(proposal);
</script>

<CardBlock limitHeight={false}>
  <svelte:fragment slot="title">{actionKey}</svelte:fragment>
  <ul class="proposal-actions">
    {#each actionFields as [key, value]}
      <li>
        <h4>{key}</h4>
        {#if typeof value === "object"}
          <p class="json">
            <Json json={value} />
          </p>
        {:else}
          <p>
            {value}
          </p>
        {/if}
      </li>
    {/each}
    {#if nnsFunctionId !== undefined}
      <NnsFunctionDetails {proposalId} {nnsFunctionId} />
    {/if}
  </ul>
</CardBlock>

<style lang="scss">
  @use "../../../themes/mixins/media";

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  :global(.proposal-actions li) {
    margin-bottom: var(--padding);
  }

  :global(.proposal-actions h4) {
    font-size: var(--font-size-ultra-small);
    color: var(--background-contrast);
    line-height: 1;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }
  }
  :global(.proposal-actions p) {
    font-size: var(--font-size-ultra-small);
    color: var(--gray-200);
    overflow-wrap: break-word;
    white-space: pre-wrap;

    @include media.min-width(medium) {
      font-size: var(--font-size-small);
    }
  }
</style>
