<script lang="ts">
  import ProjectLogo from "$lib/components/summary/ProjectLogo.svelte";
  import { INTERNET_COMPUTER, IC_LOGO } from "$lib/constants/icp.constants";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import SelectProjectDropdownWrapper from "$lib/components/summary/SelectProjectDropdownWrapper.svelte";
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";

  let summary: SnsSummary | undefined;
  $: summary = $snsProjectSelectedStore?.summary;

  let logo: string;
  $: logo = summary?.metadata.logo ?? IC_LOGO;

  let title: string;
  $: title = summary?.metadata.name ?? INTERNET_COMPUTER;

  // TODO: clean CSS when removing ENABLE_SNS - i.e. remove style not(.sns)
  let sns = ENABLE_SNS;
</script>

<div class="summary" data-tid="accounts-summary" class:sns>
  <div class="logo" class:sns>
    <ProjectLogo size="big" />
  </div>

  {#if sns}
    <SelectProjectDropdownWrapper />
  {:else}
    <h1 data-tid="accounts-title">{title}</h1>
  {/if}

  <slot name="details" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/text";

  .summary {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 0 var(--padding-3x);
    max-width: 100%;

    @include media.min-width(small) {
      display: grid;
      grid-template-columns: repeat(2, auto);

      column-gap: var(--padding-2x);

      margin: var(--padding) 0 var(--padding-3x);

      width: fit-content;
    }

    word-break: break-all;

    &:not(.sns) {
      display: grid;
      grid-template-columns: repeat(2, auto);

      column-gap: var(--padding-2x);

      margin: var(--padding) 0 var(--padding-3x);

      width: fit-content;
    }
  }

  h1 {
    display: inline-block;
    @include text.truncate;
  }

  .logo {
    grid-row: 1 / 3;

    &.sns {
      --logo-display: none;

      @include media.min-width(small) {
        --logo-display: block;
      }
    }
  }
</style>
