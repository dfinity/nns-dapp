<script lang="ts">
  import Footer from "../lib/components/common/Footer.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { listCanisters } from "../lib/services/canisters.services";
  import { canistersStore } from "../lib/stores/canisters.store";
  import { AppPath } from "../lib/constants/routes.constants";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import CanisterCard from "../lib/components/canisters/CanisterCard.svelte";
  import type { CanisterId } from "../lib/canisters/nns-dapp/nns-dapp.types";
  import { routeStore } from "../lib/stores/route.store";
  import CreateCanisterModal from "../lib/modals/canisters/CreateCanisterModal.svelte";
  import { reloadRouteData } from "../lib/utils/navigation.utils";
  import MainContentWrapper from "../lib/components/ui/MainContentWrapper.svelte";
  import LinkCanisterModal from "../lib/modals/canisters/LinkCanisterModal.svelte";

  const loadCanisters = async () => {
    try {
      await listCanisters({
        clearBeforeQuery: true,
      });
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "error.list_canisters",
        err,
      });
    }
  };

  onMount(async () => {
    const reload: boolean = reloadRouteData({
      expectedPreviousPath: AppPath.CanisterDetail,
      effectivePreviousPath: $routeStore.referrerPath,
      currentData: $canistersStore.canisters,
    });

    if (!reload) {
      return;
    }

    await loadCanisters();
  });

  const goToCanisterDetails = (canisterId: CanisterId) => () => {
    routeStore.navigate({
      path: `${AppPath.CanisterDetail}/${canisterId.toText()}`,
    });
  };

  let loading: boolean;
  $: loading = $canistersStore.canisters === undefined;
  let noCanisters: boolean;
  $: noCanisters = !loading && $canistersStore.canisters?.length === 0;

  type ModalKey = "CreateCanister" | "LinkCanister";
  let modal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (modal = key);
  const closeModal = () => (modal = undefined);
</script>

<MainContentWrapper>
  <section>
    <p>{$i18n.canisters.text}</p>
    <p class="last-info">
      {$i18n.canisters.principal_is}
      {$authStore.identity?.getPrincipal().toText()}
    </p>

    {#each $canistersStore.canisters ?? [] as canister}
      <CanisterCard
        role="link"
        ariaLabel={$i18n.neurons.aria_label_neuron_card}
        on:click={goToCanisterDetails(canister.canister_id)}
        {canister}
      />
    {/each}

    {#if noCanisters}
      <p>{$i18n.canisters.empty}</p>
    {/if}

    {#if loading}
      <SkeletonCard />
      <SkeletonCard />
    {/if}
  </section>

  {#if modal === "CreateCanister"}
    <CreateCanisterModal on:nnsClose={closeModal} />
  {/if}
  {#if modal === "LinkCanister"}
    <LinkCanisterModal on:nnsClose={closeModal} />
  {/if}

  <Footer>
    <Toolbar>
      <button
        data-tid="create-canister-button"
        class="primary"
        on:click={() => openModal("CreateCanister")}
        >{$i18n.canisters.create_canister}</button
      >
      <button
        data-tid="link-canister-button"
        class="primary"
        on:click={() => openModal("LinkCanister")}
        >{$i18n.canisters.link_canister}</button
      >
    </Toolbar>
  </Footer>
</MainContentWrapper>

<style lang="scss">
  .last-info {
    margin-bottom: var(--padding-3x);
  }
</style>
