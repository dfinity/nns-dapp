<!-- Source DFINITY Foundation -->
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
  <g clip-path="url(#clip0_72_145)">
    <path
      d="M5.83325 7.41675H14.1666C15.1331 7.41675 15.9166 8.20025 15.9166 9.16675V15.0001C15.9166 15.9666 15.1331 16.7501 14.1666 16.7501H5.83325C4.86676 16.7501 4.08325 15.9666 4.08325 15.0001V9.16675C4.08325 8.20025 4.86676 7.41675 5.83325 7.41675Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M9.9978 12.0833H10.0028"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
    <path
      d="M6.66675 6.66675V5.00008C6.66675 3.15913 8.15913 1.66675 10.0001 1.66675V1.66675C11.841 1.66675 13.3334 3.15913 13.3334 5.00008V7.08341"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="1.5"
    />
  </g>
  <defs>
    <clipPath id="clip0_72_145">
      <rect fill="currentColor" height="20" width="20" />
    </clipPath>
  </defs>
</svg>
