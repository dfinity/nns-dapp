<script lang="ts">
  export let testId = "card";
</script>

<article data-tid={testId}><slot /></article>

<style lang="scss">
  article {
    height: 100%;
    box-sizing: border-box;
    background: var(--card-background);
    /* Designs use a different shadow */
    box-shadow: var(--box-shadow);
    transition:
      color var(--animation-time-normal),
      box-shadow var(--animation-time-normal);
    border-radius: var(--border-radius-2x);
    overflow: hidden;
  }
</style>
