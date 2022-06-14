<script lang="ts">
  import { onMount, setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import type { CanisterDetails as CanisterInfo } from "../lib/canisters/nns-dapp/nns-dapp.types";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import {
    AppPath,
    SHOW_CANISTERS_ROUTE,
  } from "../lib/constants/routes.constants";
  import {
    getCanisterDetails,
    routePathCanisterId,
    listCanisters,
  } from "../lib/services/canisters.services";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";
  import { canistersStore } from "../lib/stores/canisters.store";
  import { replacePlaceholders, translate } from "../lib/utils/i18n.utils";
  import SkeletonParagraph from "../lib/components/ui/SkeletonParagraph.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import CyclesCard from "../lib/components/canister-detail/CyclesCard.svelte";
  import ControllersCard from "../lib/components/canister-detail/ControllersCard.svelte";
  import SkeletonTitle from "../lib/components/ui/SkeletonTitle.svelte";
  import { writable } from "svelte/store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
    type SelectCanisterDetailsStore,
  } from "../lib/types/canister-detail.context";
  import { debugSelectedCanisterStore } from "../lib/stores/debug.store";
  import type { CanisterDetails } from "../lib/canisters/ic-management/ic-management.canister.types";
  import AddCyclesModal from "../lib/modals/canisters/AddCyclesModal.svelte";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import DetachCanisterButton from "../lib/components/canister-detail/DetachCanisterButton.svelte";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { busy } from "../lib/stores/busy.store";
  import { getCanisterFromStore } from "../lib/utils/canisters.utils";
  import { UserNotTheControllerError } from "../lib/canisters/ic-management/ic-management.errors";
  import Card from "../lib/components/ui/Card.svelte";
  import CanisterCardTitle from "../lib/components/canisters/CanisterCardTitle.svelte";
  import CanisterCardSubTitle from "../lib/components/canisters/CanisterCardSubTitle.svelte";

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
    if (!SHOW_CANISTERS_ROUTE) {
      window.location.replace("/#/canisters");
    }

    if (!canistersStoreReady()) {
      await listCanisters({ clearBeforeQuery: false });
    }
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.Canisters,
    });

  const selectedCanisterStore = writable<SelectCanisterDetailsStore>({
    info: undefined,
    details: undefined,
    controller: undefined,
  });

  debugSelectedCanisterStore(selectedCanisterStore);

  let loadingDetails: boolean = true;
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

  let showAddCyclesModal: boolean = false;
  const closeAddCyclesModal = async () => (showAddCyclesModal = false);

  const reloadDetails = async (canisterId: Principal) => {
    try {
      loadingDetails = true;
      const newDetails = await getCanisterDetails(canisterId);
      selectedCanisterStore.update((data) => ({
        ...data,
        controller: true,
        details: newDetails,
      }));
    } catch (error) {
      const userNotController = error instanceof UserNotTheControllerError;
      // Show an error if the error is not expected.
      if (!userNotController) {
        toastsStore.error({
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

  let routeCanisterId: string | undefined;
  $: routeCanisterId = routePathCanisterId($routeStore.path);

  let selectedCanister: CanisterInfo | undefined;
  $: selectedCanister = getCanisterFromStore({
    canisterId: routeCanisterId,
    canistersStore: $canistersStore,
  });

  // TODO: The way the route path and the loading of the data are handled (following function) is really close to what is developed in Wallet.svelte
  // Therefore, there are probably ways to make this generic and refactor both routes

  $: routeCanisterId,
    selectedCanister,
    canistersReady,
    (() => {
      if (!canistersReady) {
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
          reloadDetails(selectedCanister.canister_id);
        }
      }

      // handle unknown canister id from URL
      if (selectedCanister === undefined) {
        toastsStore.error({
          labelKey: replacePlaceholders($i18n.error.canister_not_found, {
            $canister_id: routeCanisterId ?? "",
          }),
        });
        goBack();
      }
    })();

  $: ({ details: canisterDetails, info: canisterInfo } =
    $selectedCanisterStore);
</script>

{#if SHOW_CANISTERS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header"
      >{$i18n.canister_detail.title}</svelte:fragment
    >

    <section>
      {#if canisterInfo !== undefined}
        <CanisterCardTitle canister={canisterInfo} titleTag="h1" />
        <CanisterCardSubTitle canister={canisterInfo} />
        <div class="actions">
          <DetachCanisterButton canisterId={canisterInfo.canister_id} />
        </div>
      {:else}
        <div class="loader-title">
          <SkeletonTitle />
        </div>
        <div class="loader-subtitle">
          <SkeletonParagraph />
        </div>
      {/if}
      {#if canisterDetails !== undefined}
        <CyclesCard cycles={canisterDetails.cycles} />
        <ControllersCard />
      {:else if errorKey !== undefined}
        <Card testId="canister-details-error-card">
          <p class="error-message">{translate({ labelKey: errorKey })}</p>
        </Card>
      {:else}
        <SkeletonCard />
        <SkeletonCard />
      {/if}
    </section>
    <svelte:fragment slot="footer">
      <Toolbar>
        <button
          class="primary"
          on:click={() => (showAddCyclesModal = true)}
          disabled={canisterInfo === undefined || $busy}
          >{$i18n.canister_detail.add_cycles}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>

  {#if showAddCyclesModal}
    <AddCyclesModal on:nnsClose={closeAddCyclesModal} />
  {/if}
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media";

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
