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
    d="M2.5 5H17.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M15.8332 5V16.6667C15.8332 17.5 14.9998 18.3333 14.1665 18.3333H5.83317C4.99984 18.3333 4.1665 17.5 4.1665 16.6667V5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M6.6665 5.00033V3.33366C6.6665 2.50033 7.49984 1.66699 8.33317 1.66699H11.6665C12.4998 1.66699 13.3332 2.50033 13.3332 3.33366V5.00033"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
