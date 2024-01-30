<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconOpenInNew } from "@dfinity/gix-components";
</script>

<a
  data-tid="manage-ii-link"
  href={$i18n.navigation.manage_ii_url}
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
