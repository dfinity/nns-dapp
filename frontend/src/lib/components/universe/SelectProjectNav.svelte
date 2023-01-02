<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { committedProjectsStore } from "$lib/stores/projects.store";
  import { onDestroy } from "svelte";
  import { Card } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";

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

<nav>
  {#each selectableProjects as { canisterId, summary } (canisterId)}
    <Card
      role="link"
      selected={canisterId === selectedCanisterId}
      transparent={canisterId !== selectedCanisterId}
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

  nav {
    padding: var(--padding-4x) var(--padding-2x);
  }

  div {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .title {
    @include fonts.standard(true);
  }
</style>
