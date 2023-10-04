<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<span class="description" data-tid={testId}>
  <slot />
</span>

<style lang="scss">
  span {
    background-color: var(--focus-background-tint);
    padding: var(--padding);
    border-radius: var(--border-radius-0_5x);
  }
</style>
