<script lang="ts">
  import { Nav, BREAKPOINT_LARGE, Spinner } from "@dfinity/gix-components";
  import SelectUniverseNavList from "$lib/components/universe/SelectUniverseNavList.svelte";
  import SelectUniverseDropdown from "$lib/components/universe/SelectUniverseDropdown.svelte";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";
  import { onMount } from "svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { listNeurons } from "$lib/services/neurons.services";
  import { definedNeuronsStore } from "$lib/stores/neurons.store";
  import { fetchAcceptingVotesProposals } from "$lib/services/$public/proposals.services";
  import { votingNnsProposalsStore } from "$lib/stores/voting-proposals.store";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import { pageStore } from "$lib/derived/page.derived";
  import { AppPath } from "$lib/constants/routes.constants";
  import { snsProjectsStore } from "$lib/derived/sns/sns-projects.derived";
  import { votingProposalCountStore } from "$lib/derived/votingProposalCount.derived";

  let innerWidth = 0;
  let list = false;

  $: list = innerWidth > BREAKPOINT_LARGE;

  onMount(async () => {
    if (
      !isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Proposals],
      }) ||
      !$authSignedInStore
    ) {
      return;
    }

    // Loading uncertified neurons is safe here, because they will be reloaded on navigation
    await listNeurons({ strategy: "query" });
    await fetchAcceptingVotesProposals($definedNeuronsStore);
    console.log($votingProposalCountStore, $votingNnsProposalsStore);
    // sns neurons & proposals TBD
  });

  let votingProposalLoading = true;
  $: votingProposalLoading =
    Object.values($votingProposalCountStore).length < $snsProjectsStore.length;
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title" data-tid="select-universe-nav-title">
    {$titleTokenSelectorStore}
    {#if votingProposalLoading}
      <Spinner inline size="small" />
    {/if}
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
