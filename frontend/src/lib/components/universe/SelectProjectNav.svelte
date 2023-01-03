<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card, Nav } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import { snsProjectIdSelectedStore } from "$lib/derived/selected-project.derived";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import { selectableProjects } from "$lib/derived/selectable-projects.derived";

  let selectedCanisterId: string;
  $: selectedCanisterId = $snsProjectIdSelectedStore.toText();
</script>

<Nav>
  <p class="title" slot="title">{$i18n.core.pick_a_project}</p>

  {#each $selectableProjects as { canisterId, summary } (canisterId)}
    <Card
      role="link"
      selected={canisterId === selectedCanisterId}
      transparent={canisterId !== selectedCanisterId}
      on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
    >
      <div class:selected={canisterId === selectedCanisterId}>
        <ProjectLogo size="big" {summary} framed={true} />

        <span class="name">{summary?.metadata.name ?? $i18n.core.ic}</span>
      </div>
    </Card>
  {/each}
</Nav>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  div {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);

    &:not(.selected) {
      --logo-framed-background: transparent;
    }
  }

  .title {
    @include media.min-width(large) {
      @include fonts.h3(true);
    }
  }

  .name {
    @include fonts.standard(true);
  }
</style>
