<script lang="ts">
  export let spacing: "medium" | "large" = "large";
</script>

<hr class:medium={spacing === "medium"} />

<style lang="scss">
  hr {
    color: var(--line);
    margin: var(--padding-4x) 0;
  }

  .medium {
    margin: var(--padding-3x) 0;
  }
</style>
