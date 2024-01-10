<script lang="ts">
  import ProposalDetail from "$lib/routes/ProposalDetail.svelte";

  // Preloaded by +page.ts
  export let data: { proposal: string | null | undefined };

  let proposalId: string | null | undefined;
  $: ({ proposal: proposalId } = data);
</script>

<ProposalDetail proposalIdText={proposalId} />
