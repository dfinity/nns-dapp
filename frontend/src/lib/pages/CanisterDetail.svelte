<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    getCanisterDetails,
    listCanisters,
  } from "$lib/services/canisters.services";
  import { i18n } from "$lib/stores/i18n";
  import { canistersStore } from "$lib/stores/canisters.store";
  import { replacePlaceholders, translate } from "$lib/utils/i18n.utils";
  import { SkeletonText, busy, Island } from "@dfinity/gix-components";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import CyclesCard from "$lib/components/canister-detail/CyclesCard.svelte";
  import ControllersCard from "$lib/components/canister-detail/ControllersCard.svelte";
  import { writable } from "svelte/store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
    type CanisterDetailsModal,
    type SelectCanisterDetailsStore,
  } from "$lib/types/canister-detail.context";
  import { debugSelectedCanisterStore } from "$lib/stores/debug.store";
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";

  import DetachCanisterButton from "$lib/components/canister-detail/DetachCanisterButton.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { getCanisterFromStore } from "$lib/utils/canisters.utils";
  import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import CanisterCardTitle from "$lib/components/canisters/CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "$lib/components/canisters/CanisterCardSubTitle.svelte";
  import Footer from "$lib/components/common/Footer.svelte";
  import { goto } from "$app/navigation";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";

  // BEGIN: loading and navigation

  // TODO: checking if ready is similar to what's done in <ProposalDetail /> for the neurons.
  // Therefore we can probably refactor this to generic function.

  const canistersStoreReady = (): boolean => {
    // We consider the canisters store as ready if it has been initialized once.
    if (canistersReady) {
      return true;
    }

    return (
      $canistersStore.canisters !== undefined &&
      $canistersStore.certified === true
    );
  };

  let canistersReady = false;
  $: $canistersStore, (canistersReady = canistersStoreReady());

  onMount(async () => {
    if (!canistersStoreReady()) {
      await listCanisters({ clearBeforeQuery: false });
    }
  });

  const goBack = (): Promise<void> => goto(AppPath.Canisters);

  const selectedCanisterStore = writable<SelectCanisterDetailsStore>({
    info: undefined,
    details: undefined,
    controller: undefined,
    modal: undefined,
  });

  debugSelectedCanisterStore(selectedCanisterStore);

  let loadingDetails = true;
  let canisterInfo: CanisterInfo | undefined;
  let canisterDetails: CanisterDetails | undefined = undefined;
  $: canisterDetails = $selectedCanisterStore.details;
  let errorKey: string | undefined = undefined;
  $: errorKey =
    $selectedCanisterStore.controller === false
      ? "error.not_canister_controller"
      : $selectedCanisterStore.controller === undefined && !loadingDetails
      ? "error.canister_details_not_found"
      : undefined;

  const reloadDetails = async (canisterId: Principal) => {
    try {
      loadingDetails = true;
      const newDetails = await getCanisterDetails(canisterId);
      selectedCanisterStore.update((data) => ({
        ...data,
        controller: true,
        details: newDetails,
      }));
    } catch (error: unknown) {
      const userNotController = error instanceof UserNotTheControllerError;
      // Show an error if the error is not expected.
      if (!userNotController) {
        toastsError({
          labelKey: "error.canister_details_not_found",
        });
      }
      selectedCanisterStore.update((data) => ({
        ...data,
        details: undefined,
        controller: userNotController ? false : undefined,
      }));
    } finally {
      loadingDetails = false;
    }
  };

  const toggleModal = (modal: CanisterDetailsModal | undefined) =>
    selectedCanisterStore.update((data) => ({ ...data, modal }));

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: selectedCanisterStore,
    reloadDetails,
    toggleModal,
  });

  export let canisterId: string | undefined | null;

  let selectedCanister: CanisterInfo | undefined;
  $: selectedCanister = getCanisterFromStore({
    canisterId,
    canistersStore: $canistersStore,
  });

  $: canisterId,
    selectedCanister,
    canistersReady,
    (async () => {
      // When detaching, this is also executed but there is no `canisterId`.
      if (!canistersReady || canisterId === undefined) {
        return;
      }

      const storeCanister: CanisterInfo | undefined =
        $selectedCanisterStore.info;

      if (storeCanister !== selectedCanister) {
        // If we select another canister, then the details are set separately to update the UI with the canister and
        // display the loader - skeleton - while we load the details.
        //
        // On the contrary, if we reload the details of the same canister, we keep the current list to avoid a flickering of the screen.
        const sameCanister: boolean =
          selectedCanister !== undefined &&
          storeCanister?.canister_id.toHex() ===
            selectedCanister.canister_id.toText();

        selectedCanisterStore.update(({ details, controller }) => ({
          info: selectedCanister,
          details: sameCanister ? details : undefined,
          controller: sameCanister ? controller : undefined,
          modal: undefined,
        }));

        if (selectedCanister !== undefined) {
          await reloadDetails(selectedCanister.canister_id);
        }
      }

      // handle unknown canister id from URL
      if (selectedCanister === undefined) {
        // Show toast only it was not already present in the store
        // for example, after detaching, the storeCanister is present, but not the selectedCanister
        if (storeCanister === undefined) {
          toastsError({
            labelKey: replacePlaceholders($i18n.error.canister_not_found, {
              $canister_id: canisterId ?? "",
            }),
          });
        }

        await goBack();
      }
    })();

  $: ({ details: canisterDetails, info: canisterInfo } =
    $selectedCanisterStore);

  // END: loading and navigation
</script>

<Island>
  <main class="legacy">
    <section>
      {#if canisterInfo !== undefined}
        <CanisterCardTitle canister={canisterInfo} titleTag="h1" />
        <CanisterCardSubTitle canister={canisterInfo} />
        <div class="actions">
          <DetachCanisterButton />
        </div>
      {:else}
        <div class="loader-title">
          <SkeletonText tagName="h1" />
        </div>
        <div class="loader-subtitle">
          <SkeletonText />
        </div>
      {/if}
      {#if canisterDetails !== undefined}
        <CyclesCard cycles={canisterDetails.cycles} />
        <ControllersCard />
      {:else if errorKey !== undefined}
        <CardInfo testId="canister-details-error-card">
          <p class="error-message">{translate({ labelKey: errorKey })}</p>
        </CardInfo>
      {:else}
        <SkeletonCard />
        <SkeletonCard />
      {/if}
    </section>
  </main>
</Island>

<Footer columns={1}>
  <button
    class="primary"
    on:click={() => toggleModal("add-cycles")}
    disabled={canisterInfo === undefined || $busy}
    >{$i18n.canister_detail.add_cycles}</button
  >
</Footer>

<CanisterDetailModals />

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  .actions {
    margin-bottom: var(--padding-3x);
    display: flex;
    justify-content: end;
  }

  .error-message {
    margin: 0;
  }

  .loader-title {
    width: 100%;
    margin-top: var(--padding);
    margin-bottom: var(--padding-2x);

    @include media.min-width(medium) {
      width: 50%;
    }
  }

  .loader-subtitle {
    width: 100%;
    margin-bottom: var(--padding-3x);

    @include media.min-width(medium) {
      width: 35%;
    }
  }
</style>
