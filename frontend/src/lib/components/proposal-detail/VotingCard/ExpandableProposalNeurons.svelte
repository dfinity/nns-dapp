<script lang="ts">
  import { IconExpandCircleDown, Collapsible } from "@dfinity/gix-components";

  export let testId: string;

  let toggleContent: () => void;
  let expanded: boolean;
</script>

<Collapsible
  {testId}
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  bind:expanded
  wrapHeight
>
  <div slot="header" class="total" class:expanded>
    <div class="total-neurons">
      <span class="value" data-tid="voting-collapsible-toolbar-neurons">
        <slot name="start" />
      </span>
      <button
        class="icon"
        class:expanded
        on:click|stopPropagation={toggleContent}
      >
        <IconExpandCircleDown />
      </button>
    </div>

    <div
      class="total-voting-power"
      data-tid="voting-collapsible-toolbar-voting-power"
    >
      <slot name="end" />
    </div>
  </div>

  <slot />
</Collapsible>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .total {
    display: flex;
    justify-content: space-between;
    gap: var(--padding);
    width: 100%;
    //margin-bottom: var(--padding-3x);
    //padding: var(--padding) var(--padding-2x);

    @include media.min-width(large) {
      padding: 0 var(--padding) 0 0;
    }
  }

  .total-neurons,
  .total-voting-power {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    transition: transform ease-in var(--animation-time-normal);

    &.expanded {
      transform: rotate(-180deg);
    }
  }
</style>
