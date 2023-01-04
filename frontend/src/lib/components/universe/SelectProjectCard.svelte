<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card, IconExpandMore } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import type { SnsSummary } from "$lib/types/sns";

  export let selected: boolean;
  export let canisterId: string;
  export let summary: SnsSummary | undefined = undefined;
  export let expandMoreIcon = false;
</script>

<Card
  role="link"
  {selected}
  transparent={!selected}
  on:click={async () => await goto(buildSwitchUniverseUrl(canisterId))}
>
  <div class="container" class:selected>
    <ProjectLogo size="big" {summary} framed={true} />

    <div class="content">
      <span class="name">{summary?.metadata.name ?? $i18n.core.ic}</span>
      <slot />
    </div>

    {#if expandMoreIcon}
      <div class="icon">
        <IconExpandMore />
      </div>
    {/if}
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .container {
    display: flex;
    align-items: center;
    gap: var(--padding-2x);

    &:not(.selected) {
      --logo-framed-background: transparent;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .name {
    @include fonts.standard(true);

    padding-top: var(--padding-0_5x);

    @include media.min-width(large) {
      padding-top: 0;
    }
  }

  .icon {
    color: var(--tertiary);
  }
</style>
