<script lang="ts">
  import type { Proposal, ProposalId } from "@dfinity/nns";
  import CardBlock from "../../ui/CardBlock.svelte";
  import {
    proposalFirstActionKey,
    proposalActionFields,
    getNnsFunction,
  } from "../../../utils/proposals.utils";
  import Json from "../../common/Json.svelte";
  import NnsFunctionDetails from "./NnsFunctionDetails.svelte";
  import type {NnsFunction} from '@dfinity/nns';

  export let proposalId: ProposalId | undefined;
  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    (proposal !== undefined && proposalActionFields(proposal)) || [];

  let nnsFunction: NnsFunction | undefined;
  $: nnsFunction = getNnsFunction(proposal);

  // TODO(L2-965): delete legacy component - duplicated by the new component <ProposalActions />
</script>

<CardBlock limitHeight={false}>
  <svelte:fragment slot="title">{actionKey}</svelte:fragment>
  <dl>
    {#each actionFields as [key, value]}
      <dt>{key}</dt>
      {#if typeof value === "object"}
        <dd><Json json={value} /></dd>
      {:else}
        <dd>{value}</dd>
      {/if}
    {/each}

    {#if nnsFunction !== undefined && proposalId !== undefined}
      <NnsFunctionDetails {proposalId} {nnsFunction} />
    {/if}
  </dl>
</CardBlock>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  dl {
    margin: 0;

    :global(dt) {
      font-size: var(--font-size-ultra-small);
      color: var(--label-color);
      line-height: 1;
      margin: 0 0 var(--padding-0_5x);

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
    :global(dd) {
      margin: 0 0 var(--padding-2x);

      font-size: var(--font-size-ultra-small);
      color: var(--value-color);
      overflow-wrap: break-word;
      white-space: pre-wrap;

      @include media.min-width(medium) {
        font-size: var(--font-size-small);
      }
    }
  }
</style>
