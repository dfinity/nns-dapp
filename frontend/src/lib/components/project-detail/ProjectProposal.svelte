<script lang="ts">
  import NnsProposalCard from "$lib/components/proposals/NnsProposalCard.svelte";
  import { getProjectProposal } from "$lib/getters/sns-summary";
  import { loadProposal } from "$lib/services/public/proposals.services";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummary } from "$lib/types/sns";
  import { IconInfo } from "@dfinity/gix-components";
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
        silentErrorMessages: true,
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
{:else if nonNullish(proposalId)}
  <h3>{$i18n.sns_project_detail.swap_proposal}</h3>
  <div class="info-message">
    <IconInfo size="24" />
    <span>
      You can find the proposal details on the
      <a
        href="https://dashboard.internetcomputer.org/proposal/{proposalId}"
        target="_blank">dashboard</a
      >.
    </span>
  </div>
{/if}

<style lang="scss">
  h3 {
    margin: var(--padding-8x) 0 var(--padding-3x);
  }

  .info-message {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);
    padding: 14px 16px;
    margin: 16px 0;
    background-color: #f0f7ff;
    border-left: 4px solid #2196f3;
    border-radius: 4px;
    color: #333;
    font-size: 16px;
    line-height: 1.5;
  }

  .info-message a {
    color: #0d6efd;
    text-decoration: underline;
    margin-left: 4px;
  }

  /* Optional hover effect for the entire message */
  .info-message:hover {
    background-color: #e3f2fd;
    transition: background-color 0.2s ease;
  }
</style>
