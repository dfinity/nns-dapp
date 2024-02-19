<script lang="ts">
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { queryVotingProposals } from "$lib/services/$public/proposals.services";
  import { queryVotingSnsProposals } from "$lib/services/$public/sns-voting-proposals.services";
  import { votingProposalIndicationEnabledStore } from "$lib/derived/voting-proposal-indication.derived";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;

  const updateVotingProposals = async () => {
    await listNeurons({ strategy: "query" });
    await queryVotingProposals($definedNeuronsStore);
    await queryVotingSnsProposals();
  };
  $: $votingProposalIndicationEnabledStore && updateVotingProposals();
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
