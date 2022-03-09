<script lang="ts">
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { loadProposal } from "../../utils/proposals.utils";
  import { authStore } from "../../stores/auth.store";

  export let proposalId: ProposalId;

  let proposal: ProposalInfo | undefined = undefined;
  let summary: string | undefined = undefined;

  onMount(
    async () =>
      await loadProposal({
        proposalId,
        identity: $authStore.identity,
        setProposal: (proposalInfo: ProposalInfo) => (proposal = proposalInfo),
      })
  );

  $: summary = proposal?.proposal?.summary;
</script>

<!-- TODO: use skeleton while loading -->
<!-- TODO: markdown parser -->

{#if summary !== undefined}
  <p>{@html summary}</p>
{/if}
