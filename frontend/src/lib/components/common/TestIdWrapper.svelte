<script lang="ts">
  export let testId: string;
</script>

<div class="contents" data-tid={testId}>
  <slot />
</div>

<style lang="scss">
  .contents {
    display: contents;
  }
</style>
