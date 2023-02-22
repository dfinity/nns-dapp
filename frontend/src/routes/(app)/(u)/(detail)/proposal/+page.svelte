<script lang="ts">
  import type { AppPath } from "$lib/constants/routes.constants";
  import { afterNavigate } from "$app/navigation";
  import type { Navigation } from "@sveltejs/kit";
  import { referrerPathForNav } from "$lib/utils/page.utils";
  import ProposalDetail from "$lib/routes/ProposalDetail.svelte";

  // Preloaded by +page.ts
  export let data: { proposal: string | null | undefined };

  let proposalId: string | null | undefined;
  $: ({ proposal: proposalId } = data);

  let referrerPath: AppPath | undefined = undefined;
  afterNavigate((nav: Navigation) => (referrerPath = referrerPathForNav(nav)));
</script>

<ProposalDetail proposalIdText={proposalId} {referrerPath} />
