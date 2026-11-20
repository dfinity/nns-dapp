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
  stroke="currentColor"
  viewBox="0 0 20 20"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M17.5 18.25H2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M6.25 18.2239C5.77659 17.6875 5.41647 17.0488 5.20706 16.3452C5.07234 15.8925 5 15.413 5 14.9166C5 12.1552 7.23858 9.91663 10 9.91663C12.7614 9.91663 15 12.1552 15 14.9166C15 15.413 14.9277 15.8925 14.7929 16.3452C14.5835 17.0488 14.2234 17.6875 13.75 18.2239"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M6.66675 7.41671V5.33337"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <path
    d="M13.3333 7.41671V5.33337"
    stroke-linecap="round"
    stroke-width="1.5"
  />
  <path d="M10 5.33333V3.25" stroke-linecap="round" stroke-width="1.5" />
</svg>
