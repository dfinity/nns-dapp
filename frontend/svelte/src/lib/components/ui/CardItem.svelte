<script lang="ts">
  export let testId: string | undefined = undefined;
</script>

<article class="card-item" role="button" on:click data-tid={testId}>
  <h4><slot name="title" /></h4>
  <span><slot name="subtitle" /></span>
</article>

<style lang="scss">
  @use "../../themes/mixins/interaction";
  @use "../../themes/mixins/media";

  .card-item {
    padding: var(--padding-2x) var(--padding);
    border-radius: var(--border-radius);

    @include media.min-width(medium) {
      padding: var(--padding-4x);
    }

    @include interaction.tappable;

    &:hover {
      background: var(--background-shade);
    }

    h4 {
      line-height: 1;
      margin-bottom: var(--padding);
    }

    span {
      color: var(--gray-50);
    }
  }
</style>
