<script lang="ts">
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import { MAX_SNS_FAV_PROJECTS } from "$lib/constants/sns.constants";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import {
    addSnsFavProject,
    removeSnsFavProject,
  } from "$lib/services/sns.fav-projects.services";
  import { i18n } from "$lib/stores/i18n";
  import { snsFavProjectsStore } from "$lib/stores/sns-fav-projects.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isSnsProjectFavorite } from "$lib/utils/sns-fav-projects.utils";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import { Tooltip } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import type { Snippet } from "svelte";

  type Props = {
    project: SnsFullProject;
    children: Snippet;
  };

  const { project, children }: Props = $props();

  const loaded = $derived(nonNullish($snsFavProjectsStore.rootCanisterIds));
  const maxReached = $derived(
    ($snsFavProjectsStore.rootCanisterIds?.length ?? 0) >= MAX_SNS_FAV_PROJECTS
  );
  const userHasParticipated = $derived(
    (getCommitmentE8s(project.swapCommitment) ?? 0n) > 0n
  );
  const isFavorite = $derived(
    isSnsProjectFavorite({
      project,
      favProjects: $snsFavProjectsStore.rootCanisterIds,
    })
  );
  // Even when the maximum is reached, the button should be enabled for favorite projects
  // so that the user can remove them from favorites.
  const disabled = $derived(userHasParticipated || (maxReached && !isFavorite));
  const toggleFavorite = async (event: MouseEvent) => {
    // Avoid unwanted navigation on mobile
    event.preventDefault();

    if (isFavorite) {
      await removeSnsFavProject(project.rootCanisterId);
    } else {
      await addSnsFavProject(project.rootCanisterId);
    }

    // TODO(launchpad2): Add analytics event for this toggle
    // analytics.event("fav-projects-update-state", {
    //   value: isFavorite ? "remove" : "add",
    // });
  };
</script>

<TestIdWrapper testId="fav-project-button-component">
  {#if loaded}
    <button
      onclick={toggleFavorite}
      aria-label={$i18n.launchpad_cards.project_card_watch}
      {disabled}
    >
      {#if maxReached}
        <Tooltip
          id="max-fav-projects-reached-tooltip"
          text={replacePlaceholders(
            $i18n.fav_projects.maximum_reached_tooltip,
            {
              $max: `${MAX_SNS_FAV_PROJECTS}`,
            }
          )}
        >
          {@render children()}
        </Tooltip>
      {:else}
        {@render children()}
      {/if}
    </button>
  {/if}
</TestIdWrapper>

<style lang="scss">
  button {
    color: var(--primary);
    &:disabled {
      color: var(--tooltip-background);
    }
  }
</style>
