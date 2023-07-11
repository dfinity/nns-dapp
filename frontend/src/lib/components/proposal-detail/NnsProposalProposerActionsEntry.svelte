<script lang="ts">
  import {
    proposalActionData,
    proposalFirstActionKey,
  } from "$lib/utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import ProposalProposerActionsEntry from "./ProposalProposerActionsEntry.svelte";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionData: unknown = {};
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionData = proposal !== undefined ? proposalActionData(proposal) : {};
</script>

<ProposalProposerActionsEntry {actionKey} {actionData} />
