<script lang="ts">
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { onMount } from "svelte";
  import { authStore } from "../../stores/auth.store";
  import { loadProposal } from "../../services/proposals.services";

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

<!-- TODO(L2-282): use skeleton (new ui component) while loading -->
<!-- TODO(L2-282): markdown parser, style and add script only once in head -->
<!-- TODO(L2-282): clamp two lines and ask Mischa -->

{#if summary !== undefined}
  <p>{@html summary}</p>
{/if}
