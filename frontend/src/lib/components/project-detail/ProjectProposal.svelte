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

  // TODO: Reconciliate with proposalInfo for a long term solution
  let loadProposalError: boolean = false;
  let proposalInfo: ProposalInfo | undefined;

  const loadProposalFromId = (proposalId: ProposalId | undefined) => {
    if (nonNullish(proposalId)) {
      loadProposal({
        proposalId,
        silentErrorMessages: true,
        handleError: () => {
          loadProposalError = true;
        },
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
{:else if loadProposalError && nonNullish(proposalId)}
  <h3>{$i18n.sns_project_detail.swap_proposal}</h3>
  <div class="info-message" data-tid="proposal-card-alternative-info">
    <IconInfo size="24" />
    <span class="stack">
      <span>
        You can find the proposal details on the <a
          href="https://dashboard.internetcomputer.org/proposal/{proposalId}"
          target="_blank"
          rel="noopener noreferrer">dashboard</a
        >
        or on
        <a
          href="https://f2djv-5aaaa-aaaah-qdbea-cai.raw.icp0.io/proposal/{proposalId}"
          target="_blank"
          rel="noopener noreferrer">vpGeek</a
        >.
      </span>
      <a
        href="https://forum.dfinity.org/t/nns-governance-bug-in-proposal-136693/48224"
        class="small"
        target="_blank"
        rel="noopener noreferrer">Why is the proposal not in the dapp?</a
      >
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
    gap: var(--padding);
    padding: var(--padding-1_5x) var(--padding-2x);
    margin: var(--padding-2x) 0;
    background: var(--card-background);
    border-left: 4px solid var(--primary);
    border-radius: 4px;
    line-height: 1.5;
  }
  .stack {
    display: flex;
    flex-direction: column;
  }

  .info-message {
    a {
      color: var(--button-secondary-color);
    }

    .small {
      font-size: var(--font-size-small);
      color: var(--content-color);
    }
  }
</style>
