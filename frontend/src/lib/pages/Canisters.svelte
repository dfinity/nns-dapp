<script lang="ts">
  import type { CanisterId } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import CanisterCard from "$lib/components/canisters/CanisterCard.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Footer from "$lib/components/layout/Footer.svelte";
  import PrincipalText from "$lib/components/summary/PrincipalText.svelte";
  import SkeletonCard from "$lib/components/ui/SkeletonCard.svelte";
  import UniverseSummary from "$lib/components/universe/UniverseSummary.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { nnsUniverseStore } from "$lib/derived/nns-universe.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import CreateCanisterModal from "$lib/modals/canisters/CreateCanisterModal.svelte";
  import LinkCanisterModal from "$lib/modals/canisters/LinkCanisterModal.svelte";
  import { listCanisters } from "$lib/services/canisters.services";
  import { canistersStore } from "$lib/stores/canisters.store";
  import { i18n } from "$lib/stores/i18n";
  import { referrerPathStore } from "$lib/stores/routes.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import {
    buildCanisterUrl,
    reloadRouteData,
  } from "$lib/utils/navigation.utils";
  import { onMount } from "svelte";

  const loadCanisters = async () => {
    try {
      await listCanisters({
        clearBeforeQuery: true,
      });
    } catch (err: unknown) {
      toastsError({
        labelKey: "error.list_canisters",
        err,
      });
    }
  };

  onMount(async () => {
    const reload = reloadRouteData({
      expectedPreviousPath: AppPath.Canister,
      effectivePreviousPath: $referrerPathStore.at(-1),
      currentData: $canistersStore.canisters,
    });

    if (!reload) {
      return;
    }

    await loadCanisters();
  });

  const buildCanisterDetailsHref = (canisterId: CanisterId): string =>
    buildCanisterUrl({
      universe: $pageStore.universe,
      canister: canisterId.toText(),
    });

  let loading: boolean;
  $: loading = $canistersStore.canisters === undefined;
  let noCanisters: boolean;
  $: noCanisters = !loading && $canistersStore.canisters?.length === 0;

  type ModalKey = "CreateCanister" | "LinkCanister";
  let modal: ModalKey | undefined = undefined;
  const openModal = (key: ModalKey) => (modal = key);
  const closeModal = () => (modal = undefined);
</script>

<TestIdWrapper testId="canisters-component">
  <main>
    <div class="summary" data-tid="projects-summary">
      <h1 class="summary-title">
        <UniverseSummary universe={$nnsUniverseStore} />
      </h1>
      <div class="summary-details">
        <PrincipalText inline />
      </div>
    </div>

    <div class="card-grid">
      {#each $canistersStore.canisters ?? [] as canister (canister.canister_id)}
        <CanisterCard
          ariaLabel={$i18n.canisters.aria_label_canister_card}
          href={buildCanisterDetailsHref(canister.canister_id)}
          {canister}
        />
      {/each}

      {#if loading}
        <SkeletonCard />
        <SkeletonCard />
      {/if}
    </div>

    {#if noCanisters}
      <p class="description empty">{$i18n.canisters.text}</p>
    {/if}
  </main>

  {#if modal === "CreateCanister"}
    <CreateCanisterModal on:nnsClose={closeModal} />
  {/if}
  {#if modal === "LinkCanister"}
    <LinkCanisterModal on:nnsClose={closeModal} />
  {/if}

  <Footer>
    <button
      data-tid="create-canister-button"
      class="primary"
      on:click={() => openModal("CreateCanister")}
      >{$i18n.canisters.create_canister}</button
    >
    <button
      data-tid="link-canister-button"
      class="secondary"
      on:click={() => openModal("LinkCanister")}
      >{$i18n.canisters.link_canister}</button
    >
  </Footer>
</TestIdWrapper>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  main {
    padding-bottom: var(--footer-height);
  }

  .summary {
    display: flex;
    flex-direction: column;
    margin: 0 0 var(--padding-3x);
  }

  .summary-title {
    display: inline-flex;
  }
  .summary-details {
    height: var(--padding-4x);
    color: var(--description-color);
    @include fonts.small;
  }

  .empty {
    @include media.min-width(medium) {
      max-width: 75%;
    }
  }
</style>
