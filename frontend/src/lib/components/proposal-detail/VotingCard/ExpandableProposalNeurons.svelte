<script lang="ts">
  import { IconExpandCircleDown, Collapsible } from "@dfinity/gix-components";

  export let testId: string;

  let toggleContent: () => void;
  let expanded: boolean;
</script>

<div class="container">
  <Collapsible
    {testId}
    expandButton={false}
    externalToggle={true}
    bind:toggleContent
    bind:expanded
    wrapHeight
  >
    <div slot="header" class="header" class:expanded>
      <div class="header-entry">
        <span class="value">
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

      <div class="header-entry">
        <slot name="end" />
      </div>
    </div>

    <slot />
  </Collapsible>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .container {
    padding-bottom: var(--padding-2x);
    border-bottom: 1px solid var(--tertiary);
  }

  .header {
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

  .header-entry {
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
