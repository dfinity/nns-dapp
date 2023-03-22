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
  import { toastsError } from "$lib/stores/toasts.store";
  import { Principal } from "@dfinity/principal";

  export let proposalIdText: string | undefined | null = undefined;

  // TODO: Use proposal to render the component.
  let proposal: SnsProposalData | "loading" | "error" = "loading";

  onMount(() => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!$ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  // By storing the canister id as a text, we avoid calling the block below if the store is updated with the same value.
  let rootCanisterIdText: undefined | string;
  $: rootCanisterIdText = $snsOnlyProjectStore?.toText();
  $: {
    // TODO: Fix race condition in case the user changes the proposal before the first one hasn't loaded yet.
    if (nonNullish(proposalIdText) && nonNullish(rootCanisterIdText)) {
      const rootCanisterId = Principal.fromText(rootCanisterIdText);
      // We need this to be used in the handleError callback.
      // Otherwise, TS doesn't believe that the value of `rootCanisterIdText` won't change.
      const rootCanisterIdAtTimeOfRequest = rootCanisterIdText;
      try {
        const proposalId: SnsProposalId = { id: BigInt(proposalIdText) };
        proposal = "loading";
        getSnsProposalById({
          rootCanisterId,
          proposalId,
          setProposal: ({ proposal: proposalData }) => {
            proposal = proposalData;
          },
          handleError: () => {
            goto(
              buildProposalsUrl({ universe: rootCanisterIdAtTimeOfRequest }),
              {
                replaceState: true,
              }
            );
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
