<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  data-tid="icon-up"
  fill="none"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M10 14.375V2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M4.375 8.125L10 2.5L15.625 8.125"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M3.125 16.875H16.875"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
