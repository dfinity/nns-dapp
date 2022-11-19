<script lang="ts">
  import { loadSnsTopics } from "$lib/services/sns-neurons.services";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";
  import { onMount } from "svelte";

  // eslint-disable-next-line
  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;

  onMount(() => {
    loadSnsTopics(rootCanisterId);
  });
</script>

<Modal on:nnsClose testId="follow-sns-neurons-modal">
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <!-- TODO: Render Followees https://dfinity.atlassian.net/browse/GIX-1114 -->
  {#each neuron.followees as followee}
    <div>{JSON.stringify(followee)}</div>
  {/each}
</Modal>
