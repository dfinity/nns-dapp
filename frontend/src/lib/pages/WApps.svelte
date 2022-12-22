<script lang="ts">
  import InstallWAppModal from "$lib/modals/canisters/InstallWAppModal.svelte";
  import Footer from "$lib/components/common/Footer.svelte";
  import { toastsError } from "$lib/stores/toasts.store";
  import { toToastError } from "$lib/utils/error.utils";
  import { listDemoApps } from "$lib/services/demoapps.services";
  import type { Meta } from "$lib/canisters/demoapps/demoapps.did";
  import { onMount } from "svelte";
  import { Spinner } from "@dfinity/gix-components";

  let visible = false;

  const toggleModal = () => (visible = !visible);

  const reload = async () => {
    toggleModal();
    await load();
  };

  let loading = true;
  let metas: Meta[] = [];
  const load = async () => {
    loading = true;

    try {
      metas = await listDemoApps();
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

    <button class="primary" on:click={toggleModal}
      >Install your first wApp</button
    >
  </div>

  {#if loading}
    <Spinner />
  {:else if metas.length > 0}
    <h2>My Wallet Apps</h2>

    <div class="card-grid">
    {#each metas as meta}
      <div>Hello</div>
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
