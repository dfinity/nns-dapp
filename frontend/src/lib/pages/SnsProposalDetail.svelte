<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";

  export let proposalIdText: string | undefined | null = undefined;

  onMount(() => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });
</script>

<div class="content-grid" data-tid="sns-proposal-details-grid">
  <h1>SnsProposalDetail: {proposalIdText}</h1>
</div>
