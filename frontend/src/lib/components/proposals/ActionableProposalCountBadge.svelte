<script lang="ts">
  export let count: number;
</script>

<span data-tid="actionable-proposal-count-badge-component" class="tag"
  >{count}</span
>

<style lang="scss">
  span {
    background: var(--primary);
    color: var(--primary-contrast);
    border-radius: var(--padding-8x);
  }
</style>
