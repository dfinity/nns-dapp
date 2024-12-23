<script>
  import { i18n } from "$lib/stores/i18n";
  import { IconAccountsPage } from "@dfinity/gix-components";
  import SignIn from "../common/SignIn.svelte";
  import Card from "./Card.svelte";
</script>

<Card>
  <div class="wrapper">
    <div class="icon">
      <IconAccountsPage />
    </div>
    <h2>{$i18n.portfolio.login_title}</h2>
    <p>{$i18n.portfolio.login_description}</p>
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
      "icon title"
      "icon description"
      "action action";
    gap: var(--padding-2x);
    padding: var(--padding-2x);
    @include media.min-width(medium) {
      grid-template-columns: auto 1fr;
      grid-template-areas:
        "icon title"
        "icon description"
        "icon action";
      gap: var(--padding-3x);
      padding: var(--padding-3x) var(--padding-4x);
    }
    h2 {
      grid-area: title;
      margin: 0;
      padding: 0;
      margin-bottom: calc(var(--padding) * -1);
      @include media.min-width(medium) {
        margin-bottom: calc(var(--padding-2x) * -1);
      }
    }
    p {
      grid-area: description;
      margin: 0;
      padding: 0;
      @include media.min-width(medium) {
        grid-area: description;
        display: block;
      }
    }
    .icon {
      grid-area: icon;
      width: 80px;
      height: 80px;
      @include media.min-width(medium) {
        grid-area: icon;
        width: 144px;
        height: 144px;
      }
    }
    .action {
      grid-area: action;
      width: 100%;
      :global(button) {
        width: 100%;
      }
      @include media.min-width(medium) {
        grid-area: action;
        width: auto;
        :global(button) {
          width: auto;
        }
      }
    }
  }
</style>
