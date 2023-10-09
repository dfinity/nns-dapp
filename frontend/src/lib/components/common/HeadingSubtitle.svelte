<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<h4 data-tid={testId} class="description"><slot /></h4>

<style lang="scss">
  h4 {
    margin: 0;
    font-weight: normal;
  }
</style>
