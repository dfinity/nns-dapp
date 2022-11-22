<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import type { SnsNeuron } from "@dfinity/sns";

  export let neuron: SnsNeuron;
  export let rootCanisterId: Principal;
</script>

<Modal on:nnsClose testId="follow-sns-neurons-modal">
  <svelte:fragment slot="title"
    >{$i18n.neurons.follow_neurons_screen}</svelte:fragment
  >
  <!-- TODO: Render Followees https://dfinity.atlassian.net/browse/GIX-1114 -->
  <p>{rootCanisterId.toText()}</p>
  {#each neuron.followees as followee}
    <div>{JSON.stringify(followee)}</div>
  {/each}
</Modal>
