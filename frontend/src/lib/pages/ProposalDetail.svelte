<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { loadProposal } from "$lib/services/proposals.services";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { neuronsStore } from "$lib/stores/neurons.store";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { writable } from "svelte/store";
  import type {
    SelectedProposalContext,
    SelectedProposalStore,
  } from "$lib/types/selected-proposal.context";
  import { SELECTED_PROPOSAL_CONTEXT_KEY } from "$lib/types/selected-proposal.context";
  import { debugSelectedProposalStore } from "$lib/stores/debug.store";
  import Proposal from "$lib/components/proposal-detail/Proposal.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { goto } from "$app/navigation";

  export let proposalIdText: string | undefined | null = undefined;
  export let referrerPath: AppPath | undefined = undefined;

  // TODO(GIX-1071): refactor getLastPathDetailId to map bigint for here and in neuron detail
  const mapProposalId = (
    proposalIdText: string | undefined | null = undefined
  ): ProposalId | undefined => {
    try {
      return proposalIdText ? BigInt(proposalIdText) : undefined;
    } catch (_err: unknown) {
      return undefined;
    }
  };

  let proposalId: ProposalId | undefined = mapProposalId(proposalIdText);

  const selectedProposalStore = writable<SelectedProposalStore>({
    proposalId: undefined,
    proposal: undefined,
  });

  debugSelectedProposalStore(selectedProposalStore);

  setContext<SelectedProposalContext>(SELECTED_PROPOSAL_CONTEXT_KEY, {
    store: selectedProposalStore,
  });

  // BEGIN: loading and navigation

  // TODO(GIX-1071): utils? replaceState: true for error?
  const goBack = (): Promise<void> =>
    goto(
      referrerPath === AppPath.Launchpad ? AppPath.Launchpad : AppPath.Proposals
    );

  layoutBackStore.set(goBack);

  const findProposal = async () => {
    const onError = (certified: boolean) => {
      // Ignore "application payload size (X) cannot be larger than Y" error thrown by update calls
      if (certified) {
        return;
      }
      goBack();
    };

    await loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) =>
        selectedProposalStore.update(({ proposalId }) => ({
          proposalId,
          proposal: proposalInfo,
        })),
      handleError: onError,
      silentUpdateErrorMessages: true,
    });
  };

  onMount(async () => {
    if (proposalId === undefined) {
      await goBack();
      return;
    }

    // So we gonna load proposalId xxx and we set the id in store to avoid to load it multiple times
    selectedProposalStore.set({
      proposalId,
      proposal: undefined,
    });

    // TODO: find from store

    await findProposal();
  });

  // END: loading and navigation

  const neuronsStoreReady = (): boolean => {
    // We consider the neurons store as ready if it has been initialized once. Subsequent changes that happen after vote or other functions are handled with the busy store.
    // This to avoid the display of a spinner within the page and another spinner over it (the busy spinner) when the user vote is being processed.
    if (neuronsReady) {
      return true;
    }

    return (
      $neuronsStore.neurons !== undefined && $neuronsStore.certified === true
    );
  };

  let neuronsReady = false;
  $: $neuronsStore, (neuronsReady = neuronsStoreReady());

  // TODO: reload after vote $proposalsStore

  $: layoutTitleStore.set(
    `${$i18n.proposal_detail.title}${
      $selectedProposalStore.proposalId !== undefined
        ? ` ${$selectedProposalStore.proposalId}`
        : ""
    }`
  );
</script>

<main>
  <Proposal {neuronsReady} />
</main>
