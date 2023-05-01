<script lang="ts">
  import SignInNeurons from "$lib/pages/SignInNeurons.svelte";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import Neurons from "$lib/routes/Neurons.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";

  let innerWidth = 0;

  let list = false;
  $: list = innerWidth > BREAKPOINT_LARGE;

  $: (() => {
    layoutTitleStore.set(list ? "" : $i18n.navigation.neurons);
  })();
</script>

<svelte:window bind:innerWidth />

{#if $authSignedInStore}
  <Neurons />
{:else}
  <SignInNeurons />
{/if}
