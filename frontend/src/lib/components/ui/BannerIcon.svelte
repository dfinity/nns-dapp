<script lang="ts">
  export let status: undefined | "error" | "success" = undefined;
</script>

<div
  data-tid="banner-icon-component"
  class="icon-wrapper"
  class:error={status === "error"}
  class:success={status === "success"}
  aria-hidden="true"
>
  <slot />
</div>

<style lang="scss">
  .icon-wrapper {
    padding: var(--padding);
    display: flex;
    align-items: center;
    justify-content: center;
    // Avoid the icon from stretching
    width: max-content;

    border-radius: 50%;
    // TODO(mstr): Replace with semantically correct colors
    color: var(--blue-accent);
    background-color: var(--blue-accent-tint);

    &.error {
      color: var(--negative-emphasis);
      background-color: var(--negative-emphasis-light);
    }

    &.success {
      color: var(--positive-emphasis);
      background-color: var(--positive-emphasis-light);
    }
  }
</style>
