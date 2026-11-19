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
    d="M8.33342 13.0441H4.16675V17.2108M12.0147 7.62504H16.1814V3.45837M4.16721 8.46121C4.63445 7.30476 5.41674 6.30257 6.42517 5.56856C7.43359 4.83455 8.62875 4.39797 9.87284 4.3088C11.1169 4.21962 12.3603 4.48121 13.4631 5.06388C14.5659 5.64656 15.4824 6.52716 16.1098 7.60514M16.1814 12.2084C15.7141 13.3648 14.9318 14.367 13.9234 15.101C12.915 15.835 11.7211 16.2711 10.477 16.3602C9.23289 16.4494 7.98847 16.1879 6.88566 15.6052C5.78285 15.0225 4.86577 14.1421 4.23836 13.0641"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>

<style lang="scss">
  svg {
    animation: rotate 4s linear infinite;
  }

  /* -global- */
  @keyframes -global-rotate {
    100% {
      transform: rotate(360deg);
    }
  }
</style>
