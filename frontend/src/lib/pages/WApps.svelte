<script lang="ts">
  import InstallWAppModal from "$lib/modals/wapps/InstallWAppModal.svelte";
  import Footer from "$lib/components/common/Footer.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { toToastError } from "$lib/utils/error.utils";
  import {
    type CanisterMeta,
    listDemoApps,
  } from "$lib/services/demoapps.services";
  import { onMount } from "svelte";
  import { Spinner } from "@dfinity/gix-components";
  import WAppCard from "$lib/components/wapps/WAppCard.svelte";

  let visible = false;

  const toggleModal = () => (visible = !visible);

  const reload = async () => {
    toggleModal();
    await load();
  };

  let loading = true;
  let canisterMetas: CanisterMeta[] = [];
  const load = async () => {
    loading = true;

    try {
      canisterMetas = await listDemoApps();
    } catch (err: unknown) {
      toastsError(
        toToastError({
          err,
          fallbackErrorLabelKey: "error.accounts_not_found",
        })
      );
    }

    loading = false;
  };

  onMount(async () => load());
</script>

<main>
  <div>
    <p>
      "Wallet Apps" = new blockchain phenomenon coming on Internet Computer. Try
      it now!
    </p>

    {#if !loading && canisterMetas.length === 0}
      <button class="primary" on:click={toggleModal}
        >Install your first wApp</button
      >
    {/if}
  </div>

  {#if loading}
    <Spinner />
  {:else if canisterMetas.length > 0}
    <h2>My Wallet Apps</h2>

    <div class="card-grid">
      {#each canisterMetas as canisterMeta}
        <WAppCard {canisterMeta} />
      {/each}
    </div>
  {/if}
</main>

{#if visible}
  <InstallWAppModal on:nnsClose={toggleModal} on:nnsWAppInstalled={reload} />
{/if}

<Footer columns={1}>
  <button class="primary" on:click={toggleModal}>Install wApp</button>
</Footer>

<style lang="scss">
  main {
    padding-bottom: var(--footer-height);
  }

  h2 {
    margin: var(--padding-2x) 0;
    display: inline-flex;
    align-items: center;
    gap: var(--padding);
  }

  div {
    margin: 0 0 var(--padding-4x);
  }

  p {
    padding: 0 0 var(--padding-2x);
  }
</style>
