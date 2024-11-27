<script lang="ts">
  import BannerIcon from "$lib/components/ui/BannerIcon.svelte";

  export let status: undefined | "error" | "success" = undefined;
  export let slotContent: string | undefined = undefined;
</script>

<BannerIcon {status}>{slotContent}</BannerIcon>
