<script lang="ts">
  import Header from "../header/Header.svelte";
  import Banner from "../header/Banner.svelte";
  import MenuButton from "../header/MenuButton.svelte";
  import Menu from "./Menu.svelte";
  import Back from "../header/Back.svelte";
  import SplitPane from "../ui/SplitPane.svelte";
  import { layoutTitleStore, layoutBackStore } from "../../stores/layout.store";

  let open: boolean;
  let sticky: boolean;
</script>

<Banner />

<SplitPane bind:sticky>
  <Header slot="header">
    <svelte:fragment slot="start">
      {#if $layoutBackStore !== undefined}
        <Back on:nnsBack={$layoutBackStore} />
      {:else}
        <MenuButton bind:open />
      {/if}
    </svelte:fragment>

    {$layoutTitleStore}
  </Header>

  <Menu slot="menu" bind:open {sticky} />

  <slot />
</SplitPane>
