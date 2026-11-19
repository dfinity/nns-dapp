<!-- source: DFINITY foundation -->
<script lang="ts">
  import {
    DEFAULT_ICON_SIZE,
    DEFAULT_STROKE_WIDTH,
  } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
    strokeWidth?: string | number;
  }

  let {
    size = `${DEFAULT_ICON_SIZE}px`,
    strokeWidth = DEFAULT_STROKE_WIDTH,
  }: Props = $props();
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
    d="M10 1L10 18"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={strokeWidth}
  />
  <path
    d="M2 11L10 19L18 11"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={strokeWidth}
  />
</svg>
