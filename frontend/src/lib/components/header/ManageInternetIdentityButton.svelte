<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconOpenInNew } from "@dfinity/gix-components";
  import { getIdentityProviderUrl } from "$lib/utils/auth.utils";
</script>

<a
  data-tid="manage-ii-link"
  href={getIdentityProviderUrl()}
  rel="noopener noreferrer external"
  target="_blank"
  class="button text"
>
  <IconOpenInNew />
  {$i18n.navigation.manage_ii}
</a>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  a {
    @include account-menu.button;
  }
</style>
