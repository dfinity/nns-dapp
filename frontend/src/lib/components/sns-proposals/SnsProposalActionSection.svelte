<script lang="ts">
  import {
    proposalActionFields,
    proposalFirstActionKey,
  } from "$lib/utils/sns-proposals.utils";
  import type { SnsProposalData } from "@dfinity/sns";
  import ProposalProposerActionsEntry from "../proposal-detail/ProposalProposerActionsEntry.svelte";

  export let proposal: SnsProposalData;

  let actionKey: string | undefined;
  let actionFields: [string, unknown][] = [];
  $: actionKey =
    proposal !== undefined ? proposalFirstActionKey(proposal) : undefined;
  $: actionFields =
    proposal !== undefined ? proposalActionFields(proposal) : [];
</script>

<ProposalProposerActionsEntry {actionKey} {actionFields} />
