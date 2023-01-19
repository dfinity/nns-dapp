<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { goto } from "$app/navigation";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { ENABLE_SNS_VOTING } from "$lib/constants/environment.constants";
  import { buildProposalsUrl } from "$lib/utils/navigation.utils";
  import {snsOnlyProjectStore} from "$lib/derived/selected-project.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    debugSelectedSnsProposalStore,
  } from "$lib/derived/debug.derived";
  import { authStore } from "$lib/stores/auth.store";
  import type {
    SelectedSnsProposalContext,
    SelectedSnsProposalStore,
  } from "$lib/types/sns-selected-proposal.context";
  import { SELECTED_SNS_PROPOSAL_CONTEXT_KEY } from "$lib/types/sns-selected-proposal.context";
  import {
    loadProposal,
  } from "$lib/services/$public/sns-proposals.services";
  import type { SnsProposalData } from "@dfinity/sns";
  import { fromDefinedNullable } from "@dfinity/utils";
  import { stringifyJson } from "$lib/utils/utils.js";
  import {writable} from "svelte/store";
  import {layoutTitleStore} from "$lib/stores/layout.store";
  import {i18n} from "$lib/stores/i18n";

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
    // TODO: do we need to replace state?
    goto(
      AppPath.Proposals
    );

  const findProposal = async () => {
    const onError = (certified: boolean) => {
      // Ignore "application payload size (X) cannot be larger than Y" error thrown by update calls
      if (certified) {
        return;
      }
      goBack();
    };

    // Technically should not happen has the proposalId is checked in the auto subscriber
    if (proposalId === undefined) {
      return;
    }

    // TODO: check if needed
    if ($snsOnlyProjectStore === undefined) {
      return;
    }

    await loadProposal({
      rootCanisterId: $snsOnlyProjectStore,
      proposalId,
      setProposal: (proposalData: SnsProposalData) => {
        // User might navigate quickly between proposals - previous / next.
        // e.g. the update call of previous proposal id 3n might be fetched after user has navigated to next proposal id 2n
        if (fromDefinedNullable(proposalData.id).id !== proposalId) {
          return;
        }

        // TODO: add to A store
        tmpProposal = proposalData;
        // selectedProposalStore.update(({ proposalId }) => ({
        //   proposalId,
        //   proposal: proposalData,
        // }));
      },
      handleError: onError,
      silentUpdateErrorMessages: true,
    });
  };

  let tmpProposal: SnsProposalData | undefined;

  $: $authStore.identity,
    $snsOnlyProjectStore,
    proposalId,
    (async () => {
      if (proposalId === undefined) {
        await goBack();
        return;
      }

      // So we gonna load proposalId xxx and we set the id in store to avoid to load it multiple times
      selectedProposalStore.set({
        proposalId,
        proposal: undefined,
      });

      await findProposal();
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
  <h1>SnsProposalDetail: {proposalIdText}</h1>
  <pre>{stringifyJson(tmpProposal, { indentation: 2 })}</pre>
</div>
