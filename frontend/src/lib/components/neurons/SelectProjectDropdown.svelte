<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
  import { i18n } from "../../stores/i18n";
  import { committedProjectsStore } from "../../stores/projects.store";
  import { selectedProjectStore } from "../../derived/projects/selected-project.store";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";
  import { routeStore } from "../../stores/route.store";
  import Spinner from "../ui/Spinner.svelte";

  let selectedCanisterId: string | undefined;

  onMount(() => {
    selectedCanisterId = $selectedProjectStore.toText();
  });

  $: {
    if (
      selectedCanisterId !== undefined &&
      $committedProjectsStore !== undefined
    ) {
      console.log("before navigating");
      routeStore.navigate({
        path: $routeStore.path,
        query: `project=${selectedCanisterId}`,
      });
    }
  }

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

{#if $committedProjectsStore === undefined}
  <Spinner />
{:else}
  <Dropdown
    name="project"
    bind:selectedValue={selectedCanisterId}
    testId="select-project-dropdown"
  >
    {#each selectableProjects as { canisterId, name } (canisterId)}
      <DropdownItem value={canisterId}>{name}</DropdownItem>
    {/each}
  </Dropdown>
{/if}
