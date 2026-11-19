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
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M6.56538 8.52723L9.29289 11.2547C9.68342 11.6453 10.3166 11.6453 10.7071 11.2547L14.8152 7.14666C15.2057 6.75613 15.2057 6.12297 14.8152 5.73245L12.0877 3.00494C11.6972 2.61441 11.064 2.61441 10.6735 3.00494L6.56538 7.11302C6.17486 7.50354 6.17486 8.13671 6.56538 8.52723Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <path
    d="M14.602 11.0415L16.61 13.0495C16.7976 13.2371 16.9029 13.4914 16.9029 13.7566V15.1832M5.39813 11.0415L3.39006 13.0495C3.20252 13.2371 3.09717 13.4914 3.09717 13.7566V15.1832M3.09717 15.1832V16.9443C3.09717 17.4966 3.54488 17.9443 4.09717 17.9443H15.9029C16.4552 17.9443 16.9029 17.4966 16.9029 16.9443V15.1832M3.09717 15.1832H16.9029"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width="1.5"
  />
</svg>
