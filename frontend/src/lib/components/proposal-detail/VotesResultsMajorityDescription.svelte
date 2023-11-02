<script lang="ts">
  import { Collapsible, IconInfo } from "@dfinity/gix-components";

  let toggleContent: () => void;
  let expanded: boolean;
</script>

<Collapsible
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  bind:expanded
  wrapHeight
>
  <div slot="header" class="description" class:expanded>
    <slot name="title" />
    <button
      class="icon"
      class:expanded
      on:click|stopPropagation={toggleContent}
    >
      <IconInfo />
    </button>
  </div>
  <slot />
</Collapsible>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .icon {
    padding: 0;
    color: var(--description-color);
  }
</style>
