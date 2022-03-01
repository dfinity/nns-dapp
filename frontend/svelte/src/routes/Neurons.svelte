<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import NeuronCard from "../lib/components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../lib/modals/neurons/CreateNeuronModal.svelte";
  import type { NeuronInfo } from "@dfinity/nns";
  import { getNeurons } from "../lib/services/neurons.services";
  import Spinner from "../lib/components/ui/Spinner.svelte";

  let neurons: NeuronInfo[] | undefined;
  // TODO: To be removed once this page has been implemented
  onMount(async () => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/neurons");
    }
    neurons = await getNeurons();
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

  const goToNeuronDetails = () => {
    // TODO
    console.log("go to details");
  };
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is}
        {principalText}
      </p>

      {#if neurons}
        {#each neurons as neuron}
          <NeuronCard
            role="link"
            ariaLabel={$i18n.neurons.aria_label_neuron_card}
            on:click={goToNeuronDetails}
            {neuron}
          />
        {/each}
      {:else}
        <Spinner />
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
