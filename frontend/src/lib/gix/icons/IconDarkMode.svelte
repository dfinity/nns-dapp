<!-- source: DFINITY foundation -->
<script lang="ts">
  import { DEFAULT_ICON_SIZE } from "$lib/gix/constants/constants";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  fill="var(--icon-fill, none)"
  height={size}
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7.5 5.00008C7.5 9.14222 10.8579 12.5001 15 12.5001C15.4326 12.5001 15.8567 12.4635 16.2693 12.3933C16.6631 12.3263 17.0149 12.6897 16.852 13.0545C15.6825 15.6743 13.0545 17.5 10 17.5C5.85786 17.5 2.5 14.1423 2.5 10.0002C2.5 6.94571 4.32596 4.31769 6.94588 3.14816C7.31066 2.98532 7.67408 3.3371 7.60695 3.73089C7.53663 4.14344 7.5 4.56746 7.5 5.00008Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
