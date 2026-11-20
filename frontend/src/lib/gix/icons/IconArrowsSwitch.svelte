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
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="1.5"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path d="M15.006 18.3319V4.71411" />
  <path d="M19.0838 14.2357L15.006 18.3324L10.9282 14.2357" />
  <path d="M5.07777 2.00061V15.6184" />
  <path d="M1 6.09667L5.07778 2L9.15556 6.09667" />
</svg>
