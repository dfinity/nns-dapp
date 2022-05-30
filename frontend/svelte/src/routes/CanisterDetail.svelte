<script lang="ts">
  import { onDestroy, onMount, setContext } from "svelte";
  import type { Principal } from "@dfinity/principal";
  import type { CanisterDetails as CanisterInfo } from "../lib/canisters/nns-dapp/nns-dapp.types";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import {
    AppPath,
    SHOW_CANISTERS_ROUTE,
  } from "../lib/constants/routes.constants";
  import {
    listCanisters,
    getCanisterDetails,
    routePathCanisterId,
  } from "../lib/services/canisters.services";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";
  import { isRoutePath } from "../lib/utils/app-path.utils";
  import { canistersStore } from "../lib/stores/canisters.store";
  import { replacePlaceholders } from "../lib/utils/i18n.utils";
  import SkeletonParagraph from "../lib/components/ui/SkeletonParagraph.svelte";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import CyclesCard from "../lib/components/canisters/CyclesCard.svelte";
  import ControllersCard from "../lib/components/canisters/ControllersCard.svelte";
  import { getCanisterInfoById } from "../lib/utils/canisters.utils";
  import SkeletonTitle from "../lib/components/ui/SkeletonTitle.svelte";
  import { writable } from "svelte/store";
  import {
    CANISTER_DETAILS_CONTEXT_KEY,
    type CanisterDetailsContext,
    type SelectCanisterDetailsStore,
  } from "../lib/types/canister-detail.context";
  import { debugSelectedCanisterStore } from "../lib/stores/debug.store";
  import type { CanisterDetails } from "../lib/canisters/ic-management/ic-management.canister.types";

  onMount(async () => {
    if (!SHOW_CANISTERS_ROUTE) {
      window.location.replace("/#/canisters");
    }
    // TODO L2-628
    await listCanisters({ clearBeforeQuery: false });
  });

  let canisterId: Principal | undefined = undefined;
  let canisterInfo: CanisterInfo | undefined;
  let canisterDetails: CanisterDetails | undefined = undefined;

  const canisterDetailStore = writable<SelectCanisterDetailsStore>({
    info: undefined,
    details: undefined,
  });
  // Update data in the store if source data changes
  $: {
    // If we navigate to a page where `canisterId` is undefined
    // the `routeStore.subscribe` will redirect to Canisters Page
    if (canisterId !== undefined) {
      canisterInfo = getCanisterInfoById({
        canisterId,
        canistersStore: $canistersStore,
      });
      canisterDetailStore.update(() => ({
        info: canisterInfo,
        details: canisterDetails,
      }));
    }
  }
  debugSelectedCanisterStore(canisterDetailStore);

  setContext<CanisterDetailsContext>(CANISTER_DETAILS_CONTEXT_KEY, {
    store: canisterDetailStore,
  });

  const unsubscribeRouteStore = routeStore.subscribe(
    async ({ path: routePath }) => {
      if (!isRoutePath({ path: AppPath.CanisterDetail, routePath })) {
        return;
      }
      const newCanisterId = routePathCanisterId(routePath);

      if (newCanisterId === undefined) {
        // Navigate to the canisters list in no canisterId found
        routeStore.replace({ path: AppPath.Canisters });
        return;
      }

      // Refetch if path changes
      if (newCanisterId.toText() !== canisterId?.toText()) {
        // This automatically changes `canisterInfo`
        canisterId = newCanisterId;
        // Reset details while are being fetched
        canisterDetails = undefined;
        canisterDetails = await getCanisterDetails(newCanisterId);
      }
    }
  );
  onDestroy(unsubscribeRouteStore);

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Canisters,
    });
  };
  let canisterIdString: string | undefined;
  $: canisterIdString = canisterInfo?.canister_id.toText();
</script>

{#if SHOW_CANISTERS_ROUTE}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header"
      >{$i18n.canister_detail.title}</svelte:fragment
    >
    <!-- TS is not smart enought to understand that if canisterStore is defined, canisterIdString is also defined -->
    <section>
      {#if canisterInfo !== undefined && canisterIdString !== undefined}
        <h1>{canisterIdString}</h1>
        <p>
          {replacePlaceholders($i18n.canister_detail.id, {
            $canisterId: canisterIdString,
          })}
        </p>
      {:else}
        <div class="loader-title">
          <SkeletonTitle />
        </div>
        <div class="loader-subtitle">
          <SkeletonParagraph />
        </div>
      {/if}
      {#if canisterDetails !== undefined}
        <CyclesCard />
        <ControllersCard />
      {:else}
        <SkeletonCard />
        <SkeletonCard />
      {/if}
    </section>
  </HeadlessLayout>
{/if}

<style lang="scss">
  @use "../lib/themes/mixins/media";

  p:last-of-type {
    margin-bottom: var(--padding-3x);
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
