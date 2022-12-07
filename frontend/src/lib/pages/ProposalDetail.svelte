<script lang="ts">
  import { setContext } from "svelte";
  import { loadProposal } from "$lib/services/$public/proposals.services";
  import { AppPath } from "$lib/constants/routes.constants";
  import type { ProposalId, ProposalInfo } from "@dfinity/nns";
  import { layoutTitleStore } from "$lib/stores/layout.store";
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
  import { authStore } from "$lib/stores/auth.store";

  export let proposalIdText: string | undefined | null = undefined;
  export let referrerPath: AppPath | undefined = undefined;

  const mapProposalId = (
    proposalIdText: string | undefined | null = undefined
  ): ProposalId | undefined => {
    try {
      return proposalIdText ? BigInt(proposalIdText) : undefined;
    } catch (_err: unknown) {
      return undefined;
    }
  };

  let proposalId: ProposalId | undefined;
  $: proposalId = mapProposalId(proposalIdText);

  const selectedProposalStore = writable<SelectedProposalStore>({
    proposalId: undefined,
    proposal: undefined,
  });

  debugSelectedProposalStore(selectedProposalStore);

  setContext<SelectedProposalContext>(SELECTED_PROPOSAL_CONTEXT_KEY, {
    store: selectedProposalStore,
  });

  // BEGIN: loading and navigation

  const goBack = (): Promise<void> =>
    goto(
      referrerPath === AppPath.Launchpad ? AppPath.Launchpad : AppPath.Proposals
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

    await loadProposal({
      proposalId,
      setProposal: (proposalInfo: ProposalInfo) => {
        // User might navigate quickly between proposals - previous / next.
        // e.g. the update call of previous proposal id 3n might be fetched after user has navigated to next proposal id 2n
        if (proposalInfo.id !== proposalId) {
          return;
        }

        selectedProposalStore.update(({ proposalId }) => ({
          proposalId,
          proposal: proposalInfo,
        }));
      },
      handleError: onError,
      silentUpdateErrorMessages: true,
    });
  };

  $: $authStore.identity,
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

<main>
  <Proposal />
</main>
