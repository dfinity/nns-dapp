<script lang="ts">
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/auth.store";
  import { loadProposal } from "../../services/proposals.services";
  import ProposalSummary from "../proposal-detail/ProposalDetailCard/ProposalSummary.svelte";

  export let proposalId: ProposalId;

  let proposal: ProposalInfo | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId,
        identity: $authStore.identity,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
      })
  );
</script>

<!-- TODO(L2-282): use skeleton (new ui component) while loading -->
<!-- TODO(L2-282): clamp two lines and ask Mischa -->

{#if proposal?.proposal !== undefined}
  <ProposalSummary proposal={proposal.proposal} />

  <p>TODO</p>
{/if}
