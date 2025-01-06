<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconNeuronsPage } from "@dfinity/gix-components";

  export let primaryCard = false;
  const href = AppPath.Staking;
</script>

<Card testId="no-neurons-card">
  <div class="wrapper">
    <div class="icon">
      <IconNeuronsPage />
    </div>
    <div class="text">
      <p>{$i18n.portfolio.no_neurons_card_description}</p>
    </div>
    <a {href} class={`button ${primaryCard ? "primary" : "secondary"}`}
      >{$i18n.portfolio.no_neurons_card_button}</a
    >
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .wrapper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: var(--padding-2x);
    padding: var(--padding-2x);
    margin: 0 auto;
    height: 100%;
    text-align: center;
    @include media.min-width(medium) {
      gap: var(--padding-4x);
      padding: var(--padding-6x) var(--padding-4x);
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      @include media.min-width(medium) {
        width: 144px;
        height: 144px;
      }
    }
    .text {
      color: var(--text-description);
      p {
        margin: 0;
      }
    }
  }
</style>
