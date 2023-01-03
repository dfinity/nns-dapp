<script lang="ts">
  import { onMount } from "svelte";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { Dropdown, DropdownItem, Spinner } from "@dfinity/gix-components";
  import { goto } from "$app/navigation";
  import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";
  import { i18n } from "$lib/stores/i18n";

  let selectedCanisterId: string | undefined;

  onMount(() => {
    updateSelectedCanisterId();
  });

  // We wait until the selected project is loaded in the store. And therefore, selectable.
  // Setting the selected value before it's available in `selectableProjects` was not setting it as selected in the dropdown.
  const updateSelectedCanisterId = () => {
    if (
      $selectableProjects.find(
        ({ canisterId }) => $snsProjectIdSelectedStore.toText() === canisterId
      ) !== undefined
    ) {
      selectedCanisterId = $snsProjectIdSelectedStore.toText();
    }
  };

  $: (async () => {
    if (selectedCanisterId !== undefined) {
      await goto(buildSwitchUniverseUrl(selectedCanisterId));
    }
  })();

  // Update the selected canister id when we selectableProjects are loaded
  $: $selectableProjects, updateSelectedCanisterId();
</script>

<!-- We don't want to render the dropdown until we have a selected canister id. -->
<!-- Otherwise, it will default always to NNS before the projects are loaded and redirect themeStore. -->
{#if selectedCanisterId !== undefined}
  <Dropdown
    name="project"
    bind:selectedValue={selectedCanisterId}
    testId="select-project-dropdown"
  >
    <SummaryLogo slot="start" />

    {#each $selectableProjects as { canisterId, summary } (canisterId)}
      <DropdownItem value={canisterId}
        >{summary?.metadata.name ?? $i18n.core.ic}</DropdownItem
      >
    {/each}
  </Dropdown>
{:else}
  <!-- Extra div needed to make sure the Spinner is centered in the same place as the Dropdown -->
  <div>
    <Spinner inline />
  </div>
{/if}
