<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconUsers } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
  const linkToAddressBook = AppPath.AddressBook;

  beforeNavigate(() => dispatcher("nnsLink"));
</script>

<a data-tid="address-book" href={linkToAddressBook} class="text">
  <IconUsers />
  {$i18n.navigation.address_book}
</a>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  a {
    @include account-menu.button;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
