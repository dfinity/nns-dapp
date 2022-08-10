<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Principal } from "@dfinity/principal";
  import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
  import { i18n } from "../../stores/i18n";
  import {
    committedProjectsStore,
    snsProjectSelectedStore,
  } from "../../stores/projects.store";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";

  let selectedCanisterId: string | undefined;

  onMount(() => {
    selectedCanisterId = $snsProjectSelectedStore.toText();
  });

  $: {
    if (selectedCanisterId !== undefined) {
      snsProjectSelectedStore.set(Principal.fromText(selectedCanisterId));
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

<Dropdown
  name="project"
  bind:selectedValue={selectedCanisterId}
  testId="select-project-dropdown"
>
  {#each selectableProjects as { canisterId, name } (canisterId)}
    <DropdownItem value={canisterId}>{name}</DropdownItem>
  {/each}
</Dropdown>
