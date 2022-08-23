<script lang="ts">
  import IconInfoOutline from "../../icons/IconInfoOutline.svelte";
  import Collapsible from "./Collapsible.svelte";
</script>

<Collapsible expandButton={false}>
  <span class="wrapper" slot="header">
    <slot name="header" />
    <span class="icon">
      <IconInfoOutline />
    </span>
  </span>
  <slot />
</Collapsible>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .icon {
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
