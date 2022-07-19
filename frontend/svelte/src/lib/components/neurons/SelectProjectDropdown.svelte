<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { OWN_CANISTER_ID } from "../../constants/canister-ids.constants";
  import { loadSnsSummaries } from "../../services/sns.services";
  import { i18n } from "../../stores/i18n";
  import { committedProjectsStore } from "../../stores/projects.store";
  import { toastsStore } from "../../stores/toasts.store";
  import Dropdown from "../ui/Dropdown.svelte";
  import DropdownItem from "../ui/DropdownItem.svelte";

  export let selectedCanisterId: string | undefined = undefined;

  onMount(() => {
    // TODO: Move to initilization?
    loadSnsSummaries({
      onError: () => {
        toastsStore.error({
          labelKey: "errors.sns_loading_commited_projects",
        });
      },
    });
    selectedCanisterId = OWN_CANISTER_ID.toText();
  });

  type SelectableProject = {
    name: string;
    canisterId: string;
  };
  let selectableProjects: SelectableProject[] = [];
  const unsubscribe = committedProjectsStore.subscribe((projects) => {
    selectableProjects = [
      { name: $i18n.core.nns, canisterId: OWN_CANISTER_ID.toText() },
      ...(projects?.map(({ rootCanisterId, summary: { name } }) => ({
        name,
        canisterId: rootCanisterId.toText(),
      })) ?? []),
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
    <DropdownItem value={canisterId}>
      {name}
    </DropdownItem>
  {/each}
</Dropdown>
