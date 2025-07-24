<!-- Source DFINITY Foundation -->
<script lang="ts">
  // TODO: Replace with GIX icon
  import { DEFAULT_ICON_SIZE } from "@dfinity/gix-components";

  interface Props {
    size?: string | number;
  }

  let { size = `${DEFAULT_ICON_SIZE}px` }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 20 20"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M10 11.9961C11.0355 11.9961 11.875 11.1566 11.875 10.1211C11.875 9.08555 11.0355 8.24609 10 8.24609C8.96447 8.24609 8.125 9.08555 8.125 10.1211C8.125 11.1566 8.96447 11.9961 10 11.9961Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M7.5 6.37109C8.53553 6.37109 9.375 5.53162 9.375 4.49609C9.375 3.46055 8.53553 2.62109 7.5 2.62109C6.46447 2.62109 5.625 3.46055 5.625 4.49609C5.625 5.53162 6.46447 6.37109 7.5 6.37109Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M15.625 10.1211C16.6605 10.1211 17.5 9.28162 17.5 8.24609C17.5 7.21055 16.6605 6.37109 15.625 6.37109C14.5895 6.37109 13.75 7.21055 13.75 8.24609C13.75 9.28162 14.5895 10.1211 15.625 10.1211Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M15.625 16.3711C16.6605 16.3711 17.5 15.5316 17.5 14.4961C17.5 13.4606 16.6605 12.6211 15.625 12.6211C14.5895 12.6211 13.75 13.4606 13.75 14.4961C13.75 15.5316 14.5895 16.3711 15.625 16.3711Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M4.375 16.9961C5.41053 16.9961 6.25 16.1566 6.25 15.1211C6.25 14.0856 5.41053 13.2461 4.375 13.2461C3.33947 13.2461 2.5 14.0856 2.5 15.1211C2.5 16.1566 3.33947 16.9961 4.375 16.9961Z"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M9.24219 8.41015L8.25781 6.20702"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M13.8437 8.83984L11.7812 9.52734"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M14.1484 13.3476L11.4766 11.2695"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M8.60156 11.3633L5.77344 13.8789"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
