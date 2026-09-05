<script lang="ts">
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconInfo } from "@dfinity/gix-components";

  export let withTitle = false;
</script>

<Banner
  testId="swap-legal-banner"
  title={withTitle ? $i18n.sns_project_detail.legal_banner_title : undefined}
  titleTag="h3"
  text={$i18n.sns_project_detail.legal_banner_text}
>
  <BannerIcon slot="icon">
    <IconInfo />
  </BannerIcon>
</Banner>
