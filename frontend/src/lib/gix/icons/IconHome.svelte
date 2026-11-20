<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  data-tid="icon-home"
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
  ><path
    d="M11.636 16.382v-3.709a.662.662 0 0 0-.16-.437.515.515 0 0 0-.385-.18H8.909a.515.515 0 0 0-.386.18.662.662 0 0 0-.16.437v3.709a.663.663 0 0 1-.16.437.515.515 0 0 1-.385.181H4.545a.515.515 0 0 1-.385-.181.663.663 0 0 1-.16-.437V9.235a.714.714 0 0 1 .048-.248.647.647 0 0 1 .13-.208l5.454-5.617A.512.512 0 0 1 10 3c.136 0 .268.058.368.162l5.455 5.617c.055.059.099.13.129.208.03.078.047.162.048.248v7.147a.663.663 0 0 1-.16.437.515.515 0 0 1-.386.181h-3.272a.515.515 0 0 1-.386-.181.662.662 0 0 1-.16-.437Z"
    stroke-width="1.5"
  /></svg
>
