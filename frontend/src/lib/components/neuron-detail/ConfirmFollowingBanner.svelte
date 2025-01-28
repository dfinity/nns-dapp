<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconErrorOutline } from "@dfinity/gix-components";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";
  import { startReducingVotingPowerAfterSecondsStore } from "$lib/derived/network-economics.derived";
  import { nonNullish } from "@dfinity/utils";

  let title: string;
  $: title = $i18n.missing_rewards_banner.confirm_title;
</script>

{#if nonNullish($startReducingVotingPowerAfterSecondsStore)}
  <Banner
    testId="confirm-following-banner-component"
    {title}
    text={replacePlaceholders($i18n.missing_rewards.description, {
      $period: secondsToDissolveDelayDuration(
        $startReducingVotingPowerAfterSecondsStore
      ),
    })}
  >
    <BannerIcon slot="icon" status="error">
      <IconErrorOutline />
    </BannerIcon>
  </Banner>
{/if}
