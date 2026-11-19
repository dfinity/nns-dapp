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
    d="M9.99995 15.164C12.852 15.164 15.164 12.852 15.164 9.99995C15.164 7.14795 12.852 4.83594 9.99995 4.83594C7.14795 4.83594 4.83594 7.14795 4.83594 9.99995C4.83594 12.852 7.14795 15.164 9.99995 15.164Z"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M10 2.08185V1.39331"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M4.39701 4.39701L3.91504 3.91504"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M2.08185 10H1.39331"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M4.39701 15.603L3.91504 16.085"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M10 17.9182V18.6067"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M15.603 15.603L16.085 16.085"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M17.9182 10H18.6067"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M15.603 4.39701L16.085 3.91504"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
