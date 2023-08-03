<script lang="ts">
  import { ItemAction } from "@dfinity/gix-components";

  export let testId: string;
</script>

<ItemAction {testId}>
  <div class="icon" slot="icon">
    <slot name="icon" />
  </div>
  <div class="content">
    <h4 data-tid="title"><slot name="title" /></h4>
    <p data-tid="subtitle" class="description"><slot name="subtitle" /></p>
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
      margin: 0;
    }
  }

  .actions {
    display: flex;
    gap: var(--padding);
  }

  .icon {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
    background: var(--content-background);
  }
</style>
