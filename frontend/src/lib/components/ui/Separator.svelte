<script lang="ts">
  export let spacing: "medium" | "large" | "none" = "large";
</script>

<hr class:medium={spacing === "medium"} class:no-margin={spacing === "none"} />

<style lang="scss">
  hr {
    color: var(--line);
    margin: var(--padding-4x) 0;
  }

  .medium {
    margin: var(--padding-3x) 0;
  }

  .no-margin {
    margin: 0;
  }
</style>
