<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { authStore } from "../lib/stores/auth.store";
  import type { AuthStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import NeuronCard from "../lib/components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../lib/modals/neurons/CreateNeuronModal.svelte";
  import type { NeuronId } from "@dfinity/nns";
  import { listNeurons } from "../lib/services/neurons.services";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { neuronsStore } from "../lib/stores/neurons.store";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";

  let isLoading: boolean = false;
  // TODO: To be removed once this page has been implemented
  const showThisRoute = process.env.REDIRECT_TO_LEGACY === "never";
  onMount(async () => {
    if (!showThisRoute) {
      window.location.replace("/#/neurons");
    }
    try {
      isLoading = true;
      await listNeurons({ identity: $authStore.identity });
    } catch (err) {
      toastsStore.error({
        labelKey: "errors.get_neurons",
        err,
      });
    } finally {
      isLoading = false;
    }
  });

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ identity }: AuthStore) =>
      (principalText = identity?.getPrincipal().toText() ?? "")
  );

  onDestroy(unsubscribe);

  let showStakeNeuronModal: boolean = false;
  const stakeNeurons = () => (showStakeNeuronModal = true);

  const closeModal = () => (showStakeNeuronModal = false);

  const goToNeuronDetails = (id: NeuronId) => () => {
    routeStore.navigate({
      path: `${AppPath.NeuronDetail}/${id}`,
    });
  };
</script>

{#if showThisRoute}
  <Layout>
    <section>
      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is}
        {principalText}
      </p>

      {#if isLoading}
        <Spinner />
      {:else}
        {#each $neuronsStore as neuron}
          <NeuronCard
            role="link"
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            on:click={goToNeuronDetails(neuron.neuronId)}
            {neuron}
          />
        {/each}
      {/if}
    </section>
    <svelte:fragment slot="footer">
      <Toolbar>
        <button class="primary" on:click={stakeNeurons}
          >{$i18n.neurons.stake_neurons}</button
        >
      </Toolbar>
    </svelte:fragment>
    {#if showStakeNeuronModal}
      <CreateNeuronModal on:nnsClose={closeModal} />
    {/if}
  </Layout>
{/if}

<style lang="scss">
  p:last-of-type {
    margin-bottom: calc(3 * var(--padding));
  }
</style>
