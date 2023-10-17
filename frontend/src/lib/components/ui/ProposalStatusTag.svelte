<script lang="ts">
  // TODO: switch to ids
  export let statusString: string;

  let statusClass: string;
  $: statusClass = statusString.toLowerCase();

  let label: string;
  $: label = statusString;
</script>

<span data-tid="proposal-status" class={`tag ${statusClass}`}>{label}</span>

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
    &.adopted,
    &.accepted {
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
