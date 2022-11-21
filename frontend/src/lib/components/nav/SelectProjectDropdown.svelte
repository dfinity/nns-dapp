<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { i18n } from "$lib/stores/i18n";
  import { committedProjectsStore } from "$lib/stores/projects.store";
  import { Dropdown, DropdownItem, Spinner } from "@dfinity/gix-components";
  import { goto } from "$app/navigation";
  import { UNIVERSE_PARAM } from "$lib/constants/routes.constants";

  let selectedCanisterId: string | undefined;

  onMount(() => {
    updateSelectedCanisterId();
  });

  // We wait until the selected project is loaded in the store. And therefore, selectable.
  // Setting the selected value before it's available in `selectableProjects` was not setting it as selected in the dropdown.
  const updateSelectedCanisterId = () => {
    if (
      selectableProjects.find(
        ({ canisterId }) => $snsProjectIdSelectedStore.toText() === canisterId
      ) !== undefined
    ) {
      selectedCanisterId = $snsProjectIdSelectedStore.toText();
    }
  };

  $: (async () => {
    if (selectedCanisterId !== undefined) {
      const { pathname } = window.location;
      await goto(`${pathname}?${UNIVERSE_PARAM}=${selectedCanisterId}`);
    }
  })();

  // Update the selected canister id when we selectableProjects are loaded
  $: selectableProjects, updateSelectedCanisterId();

  type SelectableProject = {
    name: string;
    canisterId: string;
  };
  const nnsProject = {
    name: $i18n.core.nns,
    canisterId: OWN_CANISTER_ID.toText(),
  };
  let selectableProjects: SelectableProject[] = [nnsProject];
  const unsubscribe = committedProjectsStore.subscribe((projects) => {
    selectableProjects = [
      nnsProject,
      ...(projects?.map(
        ({
          rootCanisterId,
          summary: {
            metadata: { name },
          },
        }) => ({
          name,
          canisterId: rootCanisterId.toText(),
        })
      ) ?? []),
    ];
  });

  onDestroy(unsubscribe);
</script>

<!-- We don't want to render the dropdown until we have a selected canister id. -->
<!-- Otherwise, it will default always to NNS before the projects are loaded and redirect themeStore. -->
{#if selectedCanisterId !== undefined}
  <Dropdown
    name="project"
    bind:selectedValue={selectedCanisterId}
    testId="select-project-dropdown"
  >
    {#each selectableProjects as { canisterId, name } (canisterId)}
      <DropdownItem value={canisterId}>{name}</DropdownItem>
    {/each}
  </Dropdown>
{:else}
  <!-- Extra div needed to make sure the Spinner is centered in the same place as the Dropdown -->
  <div>
    <Spinner inline />
  </div>
{/if}
