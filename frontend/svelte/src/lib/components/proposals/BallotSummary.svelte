<script lang="ts">
  import type { BallotInfo, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/auth.store";
  import { loadProposal } from "../../services/proposals.services";
  import ProposalSummary from "../proposal-detail/ProposalDetailCard/ProposalSummary.svelte";
  import { Vote } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";

  export let ballot: Required<BallotInfo>;

  let proposal: ProposalInfo | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId: ballot.proposalId as ProposalId,
        identity: $authStore.identity,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
      })
  );
</script>

<!-- TODO(L2-282): use skeleton (new ui component) while loading -->
<!-- TODO(L2-282): clamp two lines and ask Mischa -->

{#if proposal?.proposal !== undefined}
  <ProposalSummary proposal={proposal.proposal} />

  <p class="vote">{$i18n.core[Vote[ballot.vote].toLowerCase()]}</p>
{/if}

<style lang="scss">
  .vote {
    display: inline-flex;
    align-items: flex-start;
    justify-content: flex-end;
    font-size: var(--font-size-small);
  }
</style>
