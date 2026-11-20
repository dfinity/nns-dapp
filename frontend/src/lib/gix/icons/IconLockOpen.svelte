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
  <g clip-path="url(#clip0_72_146)">
    <path
      d="M5.83151 7.41675H14.1623C15.1282 7.41675 15.9115 8.20004 15.9115 9.16675V15.0001C15.9115 15.9668 15.1282 16.7501 14.1623 16.7501H5.83151C4.86565 16.7501 4.08228 15.9668 4.08228 15.0001V9.16675C4.08228 8.20004 4.86565 7.41675 5.83151 7.41675Z"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M12.7742 6.6665V4.25317C12.7742 2.81003 13.9441 1.64014 15.3872 1.64014V1.64014C16.8303 1.64014 18.0002 2.81003 18.0002 4.25317V4.50936"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="1.5"
    />
    <path
      d="M9.99487 12.0833H9.99988"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
    />
  </g>
  <defs>
    <clipPath id="clip0_72_146">
      <rect fill="currentColor" height="20" width="20" />
    </clipPath>
  </defs>
</svg>
