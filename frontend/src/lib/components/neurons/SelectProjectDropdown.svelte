<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
  import { snsProjectSelectedStore } from "../../derived/selected-project.derived";
  import { i18n } from "../../stores/i18n";
  import { committedProjectsStore } from "../../stores/projects.store";
  import { routeStore } from "../../stores/route.store";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";
  import { Spinner } from "@dfinity/gix-components";

  let selectedCanisterId: string | undefined;

  onMount(() => {
    updateSelectedCanisterId();
  });

  // We wait until the selected project is loaded in the store. And therefore, selectable.
  // Setting the selected value before it's available in `selectableProjects` was not setting it as selected in the dropdown.
  const updateSelectedCanisterId = () => {
    if (
      selectableProjects.find(
        ({ canisterId }) => $snsProjectSelectedStore.toText() === canisterId
      ) !== undefined
    ) {
      selectedCanisterId = $snsProjectSelectedStore.toText();
    }
  };

  $: {
    if (selectedCanisterId !== undefined) {
      routeStore.changeContext(selectedCanisterId);
    }
  }

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
