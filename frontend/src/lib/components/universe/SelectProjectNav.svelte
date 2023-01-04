<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Nav } from "@dfinity/gix-components";
  import {
    snsProjectIdSelectedStore,
    snsProjectSelectedStore,
  } from "$lib/derived/selected-project.derived";
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import SelectProjectNavCard from "$lib/components/universe/SelectProjectNavCard.svelte";
  import AccountsBalance from "$lib/components/accounts/AccountsBalance.svelte";
  import { selectedProjectBalance } from "$lib/derived/selected-project-balance.derived";

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
    >
      <AccountsBalance balance={$selectedProjectBalance.balance} />
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
</style>
