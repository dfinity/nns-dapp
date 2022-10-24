<script lang="ts">
  import ProposalDetail from "$lib/pages/ProposalDetail.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";
  import type { Navigation } from "@sveltejs/kit";

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  // Preloaded by +page.ts
  export let data: { proposal: string | null | undefined };

  let proposalId: string | null | undefined;
  $: ({ proposal: proposalId } = data);

  // TODO(GIX-1071): referer path
  const afterNavigate = ({ from }: Navigation) => {
    console.log("afterNavigate", from);
  };
</script>

{#if signedIn}
  <ProposalDetail proposalIdText={proposalId} />
{:else}
  <h1>Proposal NOT signed in</h1>

  <SignIn />
{/if}
