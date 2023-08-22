<script>
  import { Card } from "@dfinity/gix-components";
</script>

<div class="card-grid">
  <Card disabled>
    <div class="card-item" />
  </Card>
  <Card disabled>
    <div class="card-item" />
  </Card>
  <Card disabled>
    <div class="card-item" />
  </Card>
  <Card disabled>
    <div class="card-item" />
  </Card>
  <Card disabled>
    <div class="card-item" />
  </Card>
  <article class="card-dashed">
    <div class="card-item">
      <div class="select" />
    </div>
  </article>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .card-grid {
    // Only show one card for mobile
    :global(.card):nth-child(-n + 4) {
      display: none;
    }

    @include media.min-width(medium) {
      :global(.card):nth-child(-n + 4) {
        display: block;
      }
    }
  }

  .card-item {
    height: 125px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .card-dashed {
    border: 4px dashed var(--input-background);
    border-radius: var(--border-radius);

    padding: calc(var(--padding-2x) - var(--card-border-size));
    .select {
      width: 40%;
      height: calc(var(--line-height-standard) * 1rem);

      border-radius: var(--border-radius);

      background-color: var(--input-background);
    }
  }
</style>
