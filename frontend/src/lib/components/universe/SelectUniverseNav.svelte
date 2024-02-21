<script lang="ts">
  import { Nav, BREAKPOINT_LARGE } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { updateActionableSnsProposals } from "$lib/services/$public/sns-actionable-proposals.services";
  import { selectableUniversesStore } from "$lib/derived/selectable-universes.derived";
  import { ENABLE_VOTING_INDICATION } from "$lib/stores/feature-flags.store";
  import { actionableProposalIndicationEnabledStore } from "$lib/derived/actionable-proposal.derived";
  import { updateActionableProposals } from "$lib/services/$public/actionable-proposals.services";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;
  $: $ENABLE_VOTING_INDICATION &&
    $actionableProposalIndicationEnabledStore &&
    updateActionableProposals();
  $: if (
    $ENABLE_VOTING_INDICATION &&
    $actionableProposalIndicationEnabledStore &&
    $selectableUniversesStore.length > 1
  ) {
    updateActionableSnsProposals();
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
