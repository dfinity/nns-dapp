<script lang="ts">
  import { browser } from "$app/environment";
  import { i18n } from "$lib/stores/i18n";
  import { IconInfo } from "@dfinity/gix-components";
  import Banner from "../ui/Banner.svelte";
  import BannerIcon from "../ui/BannerIcon.svelte";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  const LOCAL_STORAGE_KEY = "isLedgerNeuronHotkeyWarningDisabled";

  let isDismissed = browser
    ? Boolean(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "false"))
    : false;
  let isVisible: boolean = false;
  $: isVisible = !isDismissed;

  function dismissBanner() {
    isDismissed = true;
    localStorage.setItem(LOCAL_STORAGE_KEY, "true");
  }
</script>

<TestIdWrapper testId="ledger-neuron-hotkey-warning-component">
  {#if isVisible}
    <Banner
      isClosable
      on:nnsClose={dismissBanner}
      htmlText={$i18n.losing_rewards.hw_hotkey_warning}
    >
      <BannerIcon slot="icon">
        <IconInfo />
      </BannerIcon>
    </Banner>
  {/if}
</TestIdWrapper>
