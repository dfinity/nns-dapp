<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6.85679 15H17.5M2.5 15H5M5 15V16.6667M5 15V13.3334M15.1901 10H17.5M2.5 10H13.3333M13.3333 10V11.6667M13.3333 10V8.33337M10.1901 5.00004H17.5M2.5 5.00004H8.33333M8.33333 5.00004V6.66671M8.33333 5.00004V3.33337"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
