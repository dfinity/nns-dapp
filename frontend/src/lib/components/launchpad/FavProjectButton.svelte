<script lang="ts">
  import type { Snippet } from "svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { isSnsProjectFavorite } from "$lib/utils/sns-fav-projects.utils";
  import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
  import {
    addSnsFavProject,
    removeSnsFavProject,
  } from "$lib/services/sns.fav-projects.services";
  import { MAX_SNS_FAV_PROJECTS } from "$lib/constants/sns.constants";
  import { Tooltip } from "@dfinity/gix-components";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { i18n } from "$lib/stores/i18n";
  import { nonNullish } from "@dfinity/utils";

  type Props = {
    testId: string;
    project: SnsFullProject;
    disabled: boolean;
    children: Snippet;
  };

  const { testId, project, disabled, children }: Props = $props();

  const maxReached = $derived(
    ($snsFavProjectsStore.rootCanisterIds?.length ?? 0) >= MAX_SNS_FAV_PROJECTS
  );
  const loaded = $derived(nonNullish($snsFavProjectsStore.rootCanisterIds));
  const toggleFavorite = async (event: MouseEvent) => {
    // Avoid unwanted navigation on mobile
    event.preventDefault();

    if (
      isSnsProjectFavorite({
        project,
        favProjects: $snsFavProjectsStore.rootCanisterIds,
      })
    ) {
      await removeSnsFavProject(project.rootCanisterId);
    } else {
      await addSnsFavProject(project.rootCanisterId);
    }
  };

  $inspect({
    testId,
    project: project.rootCanisterId.toText(),
    disabled,
    maxReached,
    loaded,
  });
</script>

{#if loaded}
  <button data-tid={testId} onclick={toggleFavorite} {disabled}>
    {#if maxReached}
      <Tooltip
        id="max-fav-projects-reached"
        text={replacePlaceholders($i18n.fav_projects.maximum_reached_tooltip, {
          $max: `${MAX_SNS_FAV_PROJECTS}`,
        })}
      >
        {@render children()}
      </Tooltip>
    {:else}
      {@render children()}
    {/if}
  </button>
{/if}

<style lang="scss">
  // Add styles for the favorite project button here
</style>
