<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { Card } from "@dfinity/gix-components";
  import ProjectLogo from "$lib/components/universe/ProjectLogo.svelte";
  import type { SnsSummary } from "$lib/types/sns";

  export let selected: boolean;
  export let role: "link" | "button" | "dropdown" = "link";
  export let summary: SnsSummary | undefined = undefined;

  let hasSlots = false;
  $: hasSlots = $$slots.default === true;

  let theme: "transparent" | "button" | "highlighted" | undefined =
    "transparent";
  $: theme = role === "button" ? "button" : role === "link" ? "transparent" : undefined;

  let icon: "arrow" | "expand" | "check" | undefined = undefined;
  $: icon = role === "button" ? "check" : role === "dropdown" ? "expand" : undefined;
</script>

<Card
  role={role === "link" ? "link" : "button"}
  {selected}
  {theme}
  on:click
  {icon}
>
  <div class="container" class:selected>
    <ProjectLogo size="big" {summary} framed={true} />

    <div class="content">
      <span class="name" class:offset={hasSlots}
        >{summary?.metadata.name ?? $i18n.core.ic}</span
      >
      <slot />
    </div>
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
</style>
