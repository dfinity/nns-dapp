<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card, IconExpandMore, IconCheckCircle } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import type { SnsSummary } from "$lib/types/sns";
  import { nonNullish } from "$lib/utils/utils";

  export let selected: boolean;
  export let canisterId: string;
  export let summary: SnsSummary | undefined = undefined;
  export let icon: "expand" | "check" | undefined = undefined;

  let hasSlots = false;
  $: hasSlots = $$slots.default === true;
</script>

<Card role="link" {selected} transparent={!selected} on:click>
  <div class="container" class:selected>
    <ProjectLogo size="big" {summary} framed={true} />

    <div class="content">
      <span class="name" class:offset={hasSlots}>{summary?.metadata.name ?? $i18n.core.ic}</span>
      <slot />
    </div>

    {#if nonNullish(icon)}
      <div class="icon" class:selected>
        {#if icon === "expand"}
          <IconExpandMore />
        {:else}
          <IconCheckCircle />
        {/if}
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

    &.offset {
      padding-top: var(--padding-0_5x);

      @include media.min-width(large) {
        padding-top: 0;
      }
    }
  }

  .icon {
    color: var(--tertiary);

    &.selected {
      --icon-check-circle-background: var(--primary);
      --icon-check-circle-color: var(--primary-contrast);
    }
  }
</style>
