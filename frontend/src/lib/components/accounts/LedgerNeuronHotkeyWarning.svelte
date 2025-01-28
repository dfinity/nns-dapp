<script lang="ts">
  import { browser } from "$app/environment";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconInfo } from "@dfinity/gix-components";

  const LOCAL_STORAGE_KEY = "isLedgerNeuronHotkeyWarningDisabled";

  let isDismissed = browser
    ? Boolean(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "false"))
    : false;
  let isVisible = false;
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
      htmlText={$i18n.missing_rewards.hw_hotkey_warning}
    >
      <BannerIcon slot="icon">
        <IconInfo />
      </BannerIcon>
    </Banner>
  {/if}
</TestIdWrapper>
