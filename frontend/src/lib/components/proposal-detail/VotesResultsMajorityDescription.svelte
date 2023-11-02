<script lang="ts">
  import { Collapsible, IconInfo } from "@dfinity/gix-components";

  let toggleContent: () => void;
</script>

<Collapsible
  expandButton={false}
  externalToggle={true}
  bind:toggleContent
  wrapHeight
>
  <div slot="header" class="description">
    <slot name="title" />
    <button class="icon" on:click|stopPropagation={toggleContent}>
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
