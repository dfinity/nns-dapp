<script lang="ts">
  import { IconOpenInNew } from "@dfinity/gix-components";

  export let href: string;
</script>

<a
  data-tid="link-icon-component"
  {href}
  target="_blank"
  rel="noopener noreferrer"><IconOpenInNew /></a
>

<style lang="scss">
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--padding-4x);
    height: var(--padding-4x);

    &:hover {
      color: var(--primary);
    }
  }
</style>
