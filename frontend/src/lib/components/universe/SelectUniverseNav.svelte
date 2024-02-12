<script lang="ts">
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { onMount } from "svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { fetchAcceptingVotesProposals } from "$lib/services/$public/proposals.services";
  import { votingNnsProposalsStore } from "$lib/stores/proposal-voting.store";

  export let votingIndicator: boolean = false;

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;

  onMount(async () => {
    if (!votingIndicator || !$authSignedInStore) {
      return;
    }

    // Loading uncertified neurons is safe here, because they will be reloaded on navigation
    await listNeurons({ strategy: "query" });
    await fetchAcceptingVotesProposals($definedNeuronsStore);
    console.log($votingNnsProposalsStore);
    // sns neurons & proposals TBD
  });
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title" data-tid="select-universe-nav-title">
    {$titleTokenSelectorStore}
  </p>

  {#if list}
    <SelectUniverseNavList />
  {:else}
    <SelectUniverseDropdown />
  {/if}
</Nav>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .title {
    margin: 0;

    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }
</style>
