<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import { ENABLE_SNS_VOTING } from "$lib/stores/feature-flags.store";
  import { nonNullish } from "@dfinity/utils";
  import { getSnsProposalById } from "$lib/services/$public/sns-proposals.services";
  import { snsOnlyProjectStore } from "$lib/derived/sns/sns-selected-project.derived";
  import type { SnsProposalData } from "@dfinity/sns";
  import { toastsError } from "$lib/stores/toasts.store";

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

  // By setting a local variable, we avoid calling the below text when the whole store is changes.
  let rootCanisterId = $snsOnlyProjectStore;

  // TODO: Fix race condition in case the user changes the proposal before the first one hasn't loaded yet.
  $: {
    if (nonNullish(proposalIdText) && nonNullish(rootCanisterId)) {
      // We can't be sure that `snsOnlyProjectStore` is the same when `handleError` is called.
      const rootCanisterIdText = rootCanisterId.toText();
      try {
        const proposalId = BigInt(proposalIdText);
        proposal = "loading";
        getSnsProposalById({
          rootCanisterId,
          proposalId: { id: proposalId },
          setProposal: ({ proposal: proposalData }) => {
            proposal = proposalData;
          },
          handleError: () => {
            goto(buildProposalsUrl({ universe: rootCanisterIdText }), {
              replaceState: true,
            });
          },
        });
      } catch (error) {
        proposal = "error";
        toastsError({
          labelKey: "error.wrong_proposal_id",
          substitutions: {
            $proposalId: proposalIdText,
          },
        });
        goto(buildProposalsUrl({ universe: rootCanisterIdText }), {
          replaceState: true,
        });
      }
    }
  }
</script>

<div class="content-grid" data-tid="sns-proposal-details-grid">
  <h1>SnsProposalDetail: {proposalIdText}</h1>
</div>
