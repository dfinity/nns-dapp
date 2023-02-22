<script lang="ts">
  import {
    proposalActionFields,
    proposalFirstActionKey,
  } from "$lib/utils/proposals.utils";
  import type { Proposal } from "@dfinity/nns";
  import ProposalProposerActionsEntry from "./ProposalProposerActionsEntry.svelte";

  export let proposal: Proposal | undefined;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    proposal !== undefined ? proposalActionFields(proposal) : [];
</script>

<ProposalProposerActionsEntry {actionKey} {actionFields} />
