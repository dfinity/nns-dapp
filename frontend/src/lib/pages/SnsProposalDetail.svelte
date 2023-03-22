<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";
  import { nonNullish } from "@dfinity/utils";
  import { getSnsProposalById } from "$lib/services/$public/sns-proposals.services";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { SnsProposalData, SnsProposalId } from "@dfinity/sns";

  export let proposalIdText: string | undefined | null = undefined;

  let proposal: SnsProposalData | "loading" | "error" = "loading";

  onMount(() => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!$ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  // TODO: Fix race condition in case the user changes the proposal before the first one hasn't loaded yet.
  $: {
    if (nonNullish(proposalIdText) && nonNullish($snsOnlyProjectStore)) {
      try {
        const proposalId: SnsProposalId = { id: BigInt(proposalIdText) };
        proposal = "loading";
        getSnsProposalById({
          rootCanisterId: $snsOnlyProjectStore,
          proposalId,
          setProposal: ({ proposal: proposalData }) => {
            proposal = proposalData;
          },
          handleError: () => {
            // TODO: redirect
          },
        });
      } catch (error) {
        proposal = "error";
        // TODO: Add a toast for this error and redirect
      }
    }
  }
</script>

<div class="content-grid" data-tid="sns-proposal-details-grid">
  <h1>SnsProposalDetail: {proposalIdText}</h1>
</div>
