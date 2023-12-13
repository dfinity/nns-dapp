<script>
  import { Card } from "@dfinity/gix-components";
</script>

<div class="card-grid" data-tid="empty-cards-component">
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
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .card-grid {
    // Only show one card for mobile
    :global(.card):nth-child(-n + 3) {
      display: none;
    }

    @include media.min-width(medium) {
      :global(.card):nth-child(-n + 3) {
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
</style>
