<script lang="ts">
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import { getProjectProposal } from "$lib/getters/sns-summary";
  import { loadProposal } from "$lib/services/public/proposals.services";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummary } from "$lib/types/sns";
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { nonNullish } from "@dfinity/utils";

  export let summary: SnsSummary;

  let proposalId: ProposalId | undefined;
  $: proposalId = getProjectProposal(summary);

  let proposalInfo: ProposalInfo | undefined;

  const loadProposalFromId = (proposalId: ProposalId | undefined) => {
    if (nonNullish(proposalId)) {
      loadProposal({
        proposalId,
        setProposal: (proposal: ProposalInfo) => {
          // User might navigate quickly between proposals - previous / next.
          // e.g. the update call of previous proposal id 3n might be fetched after user has navigated to next proposal id 2n
          if (proposal.id !== getProjectProposal(summary)) {
            return;
          }
          proposalInfo = proposal;
        },
      });
    }
  };

  $: loadProposalFromId(proposalId);
</script>

{#if nonNullish(proposalInfo)}
  <h3>{$i18n.sns_project_detail.swap_proposal}</h3>
  <NnsProposalCard {proposalInfo} />
{/if}

<style lang="scss">
  h3 {
    margin: var(--padding-8x) 0 var(--padding-3x);
  }
</style>
