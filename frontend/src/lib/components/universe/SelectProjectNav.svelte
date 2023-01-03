<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();
</script>

<h3>{$i18n.core.pick_a_project}</h3>

<nav>
  {#each $selectableProjects as { canisterId, summary } (canisterId)}
    <Card
      role="link"
      selected={canisterId === selectedCanisterId}
      transparent={canisterId !== selectedCanisterId}
      on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
    >
      <div class:selected={canisterId === selectedCanisterId}>
        <ProjectLogo size="big" {summary} framed={true} />

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

    &:not(.selected) {
      --logo-framed-background: transparent;
    }
  }

  .title {
    @include fonts.standard(true);
  }
</style>
