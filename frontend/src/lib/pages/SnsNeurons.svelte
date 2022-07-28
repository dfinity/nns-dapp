<script lang="ts">
  import { onMount } from "svelte";
  import SkeletonCard from "../components/ui/SkeletonCard.svelte";
  import Value from "../components/ui/Value.svelte";
  import { authStore } from "../stores/auth.store";
  import { sortedSnsNeuronStore } from "../stores/snsNeurons.store";
  import { i18n } from "../stores/i18n";

  let principalText: string = "";
  $: principalText = $authStore.identity?.getPrincipal().toText() ?? "";

  let loading = true;
  onMount(() => {
    setTimeout(() => {
      loading = false;
    }, 3000);
  });
</script>

<section data-tid="sns-neurons-body">
  <p class="description">
    {$i18n.neurons.principal_is}
    <Value>{principalText}</Value>
  </p>

  {#if loading}
    <SkeletonCard />
    <SkeletonCard />
  {:else}
    {#each $sortedSnsNeuronStore as neuron}
      <div>{neuron.id.join("")}</div>
    {/each}
  {/if}
</section>
