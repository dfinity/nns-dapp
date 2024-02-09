<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconGitHub } from "@dfinity/gix-components";
</script>

<a
  data-tid="source-code-link"
  href="https://github.com/dfinity/nns-dapp"
  rel="noopener noreferrer external"
  target="_blank"
  class="button text"
>
  <IconGitHub />
  {$i18n.navigation.source_code}
</a>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  a {
    @include account-menu.button;
  }
</style>
