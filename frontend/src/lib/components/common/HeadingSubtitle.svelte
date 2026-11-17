<script lang="ts">
  export let testId: string | undefined = undefined;
  // Opt in when the subtitle can be one long word without spaces.
  export let breakLongWords = false;
</script>

<h4
  data-tid={testId}
  class="description"
  class:break-long-words={breakLongWords}
>
  <slot />
</h4>

<style lang="scss">
  h4 {
    margin: 0;
    font-weight: normal;

    &.break-long-words {
      overflow-wrap: anywhere;
    }
  }
</style>
