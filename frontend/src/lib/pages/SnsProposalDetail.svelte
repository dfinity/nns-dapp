<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import { snsOnlyProjectStore } from "$lib/derived/selected-project.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { debugSelectedSnsProposalStore } from "$lib/derived/debug.derived";
  import { authStore } from "$lib/stores/auth.store";
  import type {
    SelectedSnsProposalContext,
    SelectedSnsProposalStore,
  } from "$lib/types/sns-selected-proposal.context";
  import { SELECTED_SNS_PROPOSAL_CONTEXT_KEY } from "$lib/types/sns-selected-proposal.context";
  import { loadProposal } from "$lib/services/$public/sns-proposals.services";
  import type { SnsProposalData } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { stringifyJson } from "$lib/utils/utils.js";
  import { writable } from "svelte/store";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Principal } from "@dfinity/principal";

  export let proposalIdText: string | undefined | null = undefined;

  onMount(() => {
    // We don't render this page if not enabled, but to be safe we redirect to the NNS proposals page as well.
    if (!ENABLE_SNS_VOTING) {
      goto(buildProposalsUrl({ universe: OWN_CANISTER_ID.toText() }), {
        replaceState: true,
      });
    }
  });

  const mapProposalId = (
    proposalIdText: string | undefined | null = undefined
  ): bigint | undefined => {
    try {
      return proposalIdText ? BigInt(proposalIdText) : undefined;
    } catch (_err: unknown) {
      return undefined;
    }
  };

  let proposalId: bigint | undefined;
  $: proposalId = mapProposalId(proposalIdText);

  const selectedProposalStore = writable<SelectedSnsProposalStore>({
    proposalId: undefined,
    proposal: undefined,
  });

  debugSelectedSnsProposalStore(selectedProposalStore);

  setContext<SelectedSnsProposalContext>(SELECTED_SNS_PROPOSAL_CONTEXT_KEY, {
    store: selectedProposalStore,
  });

  // BEGIN: loading and navigation

  const goBack = (): Promise<void> =>
    goto(AppPath.Proposals, { replaceState: true });

  const findProposal = async ({
    proposalId,
    rootCanisterId,
  }: {
    proposalId: bigint;
    rootCanisterId: Principal;
  }) => {
    const onError = (certified: boolean) => {
      if (certified) {
        return;
      }
      goBack();
    };

    console.log("lol", proposalId, rootCanisterId);

    await loadProposal({
      rootCanisterId,
      proposalId,
      setProposal: (proposalData: SnsProposalData) => {
        // User might navigate quickly between proposals - previous / next.
        // e.g. the update call of previous proposal id 3n might be fetched after user has navigated to next proposal id 2n
        const proposalDataId = fromDefinedNullable(proposalData.id).id;
        if (proposalDataId !== proposalId) {
          return;
        }

        selectedProposalStore.update(({ proposalId }) => ({
          proposalId,
          proposal: proposalData,
        }));
      },
      handleError: onError,
      silentUpdateErrorMessages: true,
    });
  };

  $: $authStore.identity,
    $snsOnlyProjectStore,
    proposalId,
    (async () => {
      // TODO: check what to do when there is no proposalId in URL
      if (proposalId === undefined) {
        await goBack();
        return;
      }

      // So we gonna load proposalId xxx and we set the id in store to avoid to load it multiple times
      selectedProposalStore.set({
        proposalId,
        proposal: undefined,
      });

      if ($snsOnlyProjectStore === undefined) {
        return;
      }

      await findProposal({
        proposalId,
        rootCanisterId: $snsOnlyProjectStore,
      });
    })();

  // END: loading and navigation

  $: layoutTitleStore.set(
    `${$i18n.proposal_detail.title}${
      $selectedProposalStore.proposalId !== undefined
        ? ` ${$selectedProposalStore.proposalId}`
        : ""
    }`
  );
</script>

<div class="content-grid" data-tid="sns-proposal-details-grid">
  <h1>{$selectedProposalStore?.proposalId}</h1>
  <pre>{stringifyJson($selectedProposalStore?.proposal, {
      indentation: 2,
    })}</pre>
</div>
