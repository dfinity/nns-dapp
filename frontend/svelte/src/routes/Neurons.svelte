<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import NeuronCard from "../lib/components/neurons/NeuronCard.svelte";
  import CreateNeuronModal from "../lib/modals/CreateNeuronModal/CreateNeuronModal.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/neurons");
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
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.neurons.title}</h1>

      <p>{$i18n.neurons.text}</p>

      <p>
        {$i18n.neurons.principal_is} "{principalText}"
      </p>

      <NeuronCard />
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
  p {
    margin-bottom: calc(2 * var(--padding));
  }
</style>
