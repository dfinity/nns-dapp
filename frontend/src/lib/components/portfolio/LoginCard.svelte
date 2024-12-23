<script>
  import SignIn from "$lib/components/common/SignIn.svelte";
  import Card from "$lib/components/portfolio/Card.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage } from "@dfinity/gix-components";
</script>

<Card testId="portfolio-login-card">
  <div class="wrapper">
    <div class="icon">
      <IconAccountsPage />
    </div>
    <div class="content">
      <h2>{$i18n.portfolio.login_title}</h2>
      <p>{$i18n.portfolio.login_description}</p>
    </div>
    <div class="action">
      <SignIn />
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "icon content"
      "action action";
    gap: var(--padding-2x);
    padding: var(--padding-2x);

    @include media.min-width(medium) {
      grid-template-columns: auto 1fr;
      grid-template-areas:
        "icon content"
        "icon action";
      gap: var(--padding-3x);
      padding: var(--padding-3x) var(--padding-4x);
    }
    .content {
      h2,
      p {
        margin: 0;
        padding: 0;
      }
      grid-area: content;
      display: flex;
      flex-direction: column;
      gap: var(--padding);
    }
    .icon {
      grid-area: icon;
      width: 80px;
      height: 80px;

      @include media.min-width(medium) {
        width: 144px;
        height: 144px;
      }
    }
    .action {
      grid-area: action;
      :global(button) {
        width: 100%;
      }

      @include media.min-width(medium) {
        :global(button) {
          width: auto;
        }
      }
    }
  }
</style>
