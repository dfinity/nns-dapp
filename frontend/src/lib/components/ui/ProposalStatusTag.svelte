<script lang="ts">
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import { i18n } from "$lib/stores/i18n";

  export let status: UniversalProposalStatus;

  let label: string;
  $: label = $i18n.proposal_status[status];
</script>

<span data-tid="proposal-status" class={`tag ${status}`}>{label}</span>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .tag {
    &.unknown {
      color: var(--disable-contrast);
      background-color: var(--disable);
    }
    &.open {
      color: var(--green);
      background-color: var(--green-tint);

      @include media.dark-theme {
        background-color: var(--green-dark);
      }
    }
    &.rejected {
      color: var(--pink);
      background-color: var(--pink-tint);
    }
    &.adopted {
      color: var(--blue);
      background-color: var(--blue-tint);
    }
    &.executed {
      color: var(--orchid);
      background-color: var(--indigo-tint);
    }
    &.failed {
      color: var(--orange);
      background-color: var(--orange-tint);
    }
  }
</style>
