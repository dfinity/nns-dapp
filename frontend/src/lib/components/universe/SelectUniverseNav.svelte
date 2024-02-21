<script lang="ts">
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { updateVotingSnsProposals } from "$lib/services/$public/sns-voting-proposals.services";
  import { updateVotingProposals } from "$lib/services/$public/voting-proposals.services";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
  import { actionableProposalIndicationEnabledStore } from "$lib/derived/actionable-proposal.derived";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;
  $: $ENABLE_VOTING_INDICATION &&
    $actionableProposalIndicationEnabledStore &&
    updateVotingProposals();
  $: if (
    $ENABLE_VOTING_INDICATION &&
    $actionableProposalIndicationEnabledStore &&
    $selectableUniversesStore.length > 1
  ) {
    updateVotingSnsProposals();
  }
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
