<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { committedProjectsStore } from "$lib/stores/projects.store";
  import { onDestroy } from "svelte";
  import { Card } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();

  type SelectableProject = {
    canisterId: string;
    summary?: SnsSummary;
  };

  const nnsProject = {
    canisterId: OWN_CANISTER_ID.toText(),
  };

  let selectableProjects: SelectableProject[] = [nnsProject];
  const unsubscribe = committedProjectsStore.subscribe((projects) => {
    selectableProjects = [
      nnsProject,
      ...(projects?.map(({ rootCanisterId, summary }) => ({
        canisterId: rootCanisterId.toText(),
        summary,
      })) ?? []),
    ];
  });

  onDestroy(unsubscribe);
</script>

<h3>Pick a project</h3>

<nav>
  {#each selectableProjects as { canisterId, summary } (canisterId)}
    <Card
      role="link"
      selected={canisterId === selectedCanisterId}
      transparent={canisterId !== selectedCanisterId}
      on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
    >
      <div>
        <ProjectLogo size="big" {summary} />

        <span class="title">{summary?.metadata.name ?? $i18n.core.nns}</span>
      </div>
    </Card>
  {/each}
</nav>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";

  h3 {
    padding: var(--padding-4x) var(--padding-4x) var(--padding-2x);
    margin: 0;
    line-height: 1.85;
  }

  nav {
    padding: var(--padding-3x) var(--padding-2x) var(--padding-4x);
  }

  div {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);
  }

  .title {
    @include fonts.standard(true);
  }
</style>
