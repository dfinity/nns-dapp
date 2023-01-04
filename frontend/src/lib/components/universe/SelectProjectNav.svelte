<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Nav, SkeletonText } from "@dfinity/gix-components";
  import {
    snsProjectIdSelectedStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import SelectProjectNavCard from "$lib/components/universe/SelectProjectCard.svelte";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { nonNullish } from "$lib/utils/utils";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();

  let innerWidth = 0;
  let list = false;

  // TODO: not sure if we want to hide/display the components with JS or CSS...
  $: list = innerWidth > 1024;
</script>

<svelte:window bind:innerWidth />

<Nav>
  <p class="title" slot="title">{$i18n.core.pick_a_project}</p>

  {#if list}
    {#each $selectableProjects as { canisterId, summary } (canisterId)}
      <SelectProjectNavCard
        {summary}
        {canisterId}
        selected={canisterId === selectedCanisterId}
      />
    {/each}
  {:else}
    <SelectProjectNavCard
      summary={$snsProjectSelectedStore?.summary}
      canisterId={selectedCanisterId}
      selected={true}
      expandMoreIcon
    >
      {#if nonNullish($selectedProjectBalance.balance)}
        <AmountDisplay copy amount={$selectedProjectBalance.balance} />
      {:else}
        <div class="skeleton">
          <SkeletonText />
        </div>
      {/if}
    </SelectProjectNavCard>
  {/if}
</Nav>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }

  .skeleton {
    display: flex;
    flex-direction: column;
    height: var(--padding-4x);
    box-sizing: border-box;
    padding: var(--padding-0_5x) 0;
    max-width: 240px;
  }
</style>
