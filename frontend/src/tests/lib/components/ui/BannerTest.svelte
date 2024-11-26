<script lang="ts">
  import Banner from "$lib/components/ui/Banner.svelte";
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";
  import { IconErrorOutline } from "@dfinity/gix-components";

  export let isClosable: boolean = false;
  export let isCritical: boolean = false;
  export let title: string | undefined = undefined;
  export let text: string | undefined = undefined;
  export let htmlText: string | undefined = undefined;
</script>

<Banner {isClosable} {isCritical} {title} {text} {htmlText} on:nnsClose>
  <BannerIcon slot="icon" status="success">
    <IconErrorOutline />
  </BannerIcon>
  <div slot="actions">
    <button>test-action</button>
  </div>
</Banner>
