<script lang="ts">
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { ItemAction } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

  export let testId: string;
  export let tooltipText: string | undefined = undefined;
  export let tooltipId: string | undefined = undefined;
</script>

<ItemAction {testId}>
  <div class="icon" slot="icon">
    <slot name="icon" />
  </div>
  <div class="content">
    <h4>
      <slot name="title" />
      {#if nonNullish(tooltipText) && nonNullish(tooltipId)}
        <TooltipIcon {tooltipId} text={tooltipText} />
      {/if}
    </h4>
    <p class="description"><slot name="subtitle" /></p>
  </div>
  <div slot="actions" class="actions">
    <slot />
  </div>
</ItemAction>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    p,
    h4 {
      display: flex;
      gap: var(--padding);
      margin: 0;
    }
  }

  .actions {
    display: flex;
    gap: var(--padding);
  }

  .icon {
    color: var(--elements-icons);
    padding: var(--padding-2x);

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
    background-color: var(--card-background-tint);
  }
</style>
