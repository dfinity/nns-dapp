<script lang="ts">
  import type { UniversalProposalStatus } from "$lib/types/proposals";
  import { i18n } from "$lib/stores/i18n";

  export let status: UniversalProposalStatus;
  export let actionable: boolean | undefined = undefined;

  let label: string;
  $: label = $i18n.universal_proposal_status[status];
</script>

<span data-tid="proposal-status-tag" class={`tag ${status}`} class:actionable
  >{label}</span
>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .tag {
    position: relative;

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

    &.actionable {
      &:after {
        content: "";
        position: absolute;
        top: calc(-1 * var(--padding-0_5x));
        right: calc(-1 * var(--padding-0_5x));
        width: var(--padding-1_5x);
        height: var(--padding-1_5x);

        box-sizing: border-box;
        border: 1.5px solid var(--card-background);
        border-radius: var(--padding-1_5x);
        background: var(--primary);
      }
    }
  }
</style>
