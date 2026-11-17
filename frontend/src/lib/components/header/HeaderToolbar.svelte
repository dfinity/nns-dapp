<script lang="ts">
  import AccountMenu from "$lib/components/header/AccountMenu.svelte";
  import AccountSyncIndicator from "$lib/components/header/AccountSyncIndicator.svelte";
  import OpenAlfredButton from "$lib/components/header/OpenAlfredButton.svelte";
</script>

<div data-tid="header-toolbar-component">
  <AccountSyncIndicator />
  <OpenAlfredButton />
  <AccountMenu />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: flex-end;
  }
</style>
