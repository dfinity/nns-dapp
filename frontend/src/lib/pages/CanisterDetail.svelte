<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/ic-management/ic-management.canister.types";
  import type { CanisterDetails as CanisterInfo } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import ControllersCard from "$lib/components/canister-detail/ControllersCard.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    getCanisterDetails,
    listCanisters,
    notifyTopUpIfNeeded,
  } from "$lib/services/canisters.services";
  import { canistersStore } from "$lib/stores/canisters.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
    type SelectCanisterDetailsStore,
  } from "$lib/types/canister-detail.context";
  import { replacePlaceholders, translate } from "$lib/utils/i18n.utils";
  import { Island, busy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { onMount, setContext } from "svelte";
  import { writable } from "svelte/store";

  import { goto } from "$app/navigation";
  import { UserNotTheControllerError } from "$lib/canisters/ic-management/ic-management.errors";
  import CanisterPageHeader from "$lib/components/canister-detail/CanisterPageHeader.svelte";
  import CanisterPageHeading from "$lib/components/canister-detail/CanisterPageHeading.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import SkeletonHeader from "$lib/components/ui/SkeletonHeader.svelte";
  import SkeletonHeading from "$lib/components/ui/SkeletonHeading.svelte";
  import CanisterDetailModals from "$lib/modals/canisters/CanisterDetailModals.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import type { CanisterDetailModal } from "$lib/types/canister-detail.modal";
  import { getCanisterFromStore } from "$lib/utils/canisters.utils";
  import { emit } from "$lib/utils/events.utils";
  import { isNullish, nonNullish } from "@dfinity/utils";

  // BEGIN: loading and navigation

  // TODO: checking if ready is similar to what's done in <ProposalDetail /> for the neurons.
  // Therefore we can probably refactor this to generic function.

  const canistersStoreReady = (): boolean => {
    // We consider the canisters store as ready if it has been initialized once.
    if (canistersReady) {
      return true;
    }

    // At the moment we load the stores with query only.
    return $canistersStore.canisters !== undefined;
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
  });

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

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: selectedCanisterStore,
    reloadDetails,
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

  let notifyChecked = false;

  const notifyIfNeeded = async (canisterId: Principal | undefined) => {
    if (notifyChecked || isNullish(canisterId)) {
      return;
    }
    notifyChecked = true;
    try {
      if (await notifyTopUpIfNeeded({ canisterId })) {
        reloadDetails(canisterId);
      }
    } catch (error: unknown) {
      // If the notification fails, we avoid showing an error since it's a background task
      // and not relevant to most users.
      console.error("Failed to notify for canister top-up:", error);
    }
  };

  $: notifyIfNeeded(canisterInfo?.canister_id);

  // END: loading and navigation

  const openModal = () =>
    emit<CanisterDetailModal>({
      message: "nnsCanisterDetailModal",
      detail: { type: "add-cycles" },
    });
</script>

<TestIdWrapper testId="canister-detail-component">
  <Island>
    <main class="legacy">
      <section>
        {#if nonNullish(canisterInfo)}
          <CanisterPageHeader canister={canisterInfo} />
          <CanisterPageHeading
            canister={canisterInfo}
            {canisterDetails}
            isController={$selectedCanisterStore.controller}
          />
          <Separator spacing="none" />
        {:else}
          <SkeletonHeader />
          <SkeletonHeading />
        {/if}
        {#if canisterDetails !== undefined}
          <ControllersCard />
        {:else if errorKey !== undefined}
          <CardInfo testId="canister-details-error-card">
            <p class="error-message">{translate({ labelKey: errorKey })}</p>
          </CardInfo>
        {:else}
          <SkeletonCard cardType="info" />
        {/if}
      </section>
    </main>
  </Island>

  <Footer columns={1}>
    <button
      data-tid="add-cycles-button"
      class="primary"
      on:click={openModal}
      disabled={canisterInfo === undefined || $busy}
      >{$i18n.canister_detail.add_cycles}</button
    >
  </Footer>

  <CanisterDetailModals />
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  section {
    display: flex;
    flex-direction: column;
    gap: var(--padding-4x);
  }

  .error-message {
    margin: 0;
  }
</style>
