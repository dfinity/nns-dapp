<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconErrorOutline } from "@dfinity/gix-components";
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { START_REDUCING_VOTING_POWER_AFTER_SECONDS } from "$lib/constants/neurons.constants";
  import { secondsToDissolveDelayDuration } from "$lib/utils/date.utils";

  let title: string;
  $: title = $i18n.losing_rewards_banner.confirm_title;

  const text = replacePlaceholders($i18n.losing_rewards.description, {
    $period: secondsToDissolveDelayDuration(
      BigInt(START_REDUCING_VOTING_POWER_AFTER_SECONDS)
    ),
  });
</script>

<Banner testId="confirm-following-banner-component" {title} {text}>
  <BannerIcon slot="icon" status="error">
    <IconErrorOutline />
  </BannerIcon>
</Banner>
