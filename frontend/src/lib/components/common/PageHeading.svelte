<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<div class="container" data-tid={testId}>
  <slot name="title" />
  <h4 class="description">
    <slot name="subtitle" />
  </h4>
</div>

<style lang="scss">
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--padding-1_5x);
    justify-content: center;
    align-items: center;

    width: 100%;

    h4 {
      margin: 0;
      font-weight: normal;
    }
  }
</style>
