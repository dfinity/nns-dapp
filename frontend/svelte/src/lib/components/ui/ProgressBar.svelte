<script lang="ts">
  // Html default is 1 anyway
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress?retiredLocale=ca#attr-max
  export let max: number = 1;
  export let value: number;
</script>

<!-- TODO: https://dfinity.atlassian.net/browse/L2-759 -->
<div>
  <slot name="top" />
  <progress {max} {value} />
  <slot name="bottom" />
</div>

<style lang="scss">
  progress {
    width: 100%;
  }
</style>
