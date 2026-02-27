<script lang="ts">
  import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { selfDescribingValueToJson } from "$lib/utils/proposals.utils";
  import { nonNullish } from "@dfinity/utils";
  import type { Proposal } from "@icp-sdk/canisters/nns";

  export let proposal: Proposal | undefined;

  let actionData: unknown = {};
  $: actionData = nonNullish(proposal?.selfDescribingAction?.value)
    ? selfDescribingValueToJson(proposal.selfDescribingAction.value)
    : {};
</script>

<ProposalProposerActionsEntry
  actionKey={$i18n.proposal_detail.payload}
  {actionData}
/>
