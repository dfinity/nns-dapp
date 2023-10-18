<script lang="ts">
  export let statusLabel: string;
  export let status:
    | "unknown"
    | "open"
    | "rejected"
    | "adopted"
    | "executed"
    | "failed";
</script>

<span data-tid="proposal-status" class={`tag ${status}`}>{statusLabel}</span>

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
