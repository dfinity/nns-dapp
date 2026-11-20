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
    d="M2.86789 13.5137L4.75851 2.80279C4.77173 2.72195 4.8009 2.64455 4.84433 2.5751C4.88776 2.50565 4.94458 2.44554 5.01148 2.39827C5.07838 2.35101 5.15402 2.31753 5.23399 2.2998C5.31396 2.28206 5.39666 2.28042 5.47726 2.29497L9.78976 3.05279C9.9527 3.08325 10.0972 3.17643 10.1921 3.3123C10.2871 3.44816 10.325 3.61586 10.2976 3.77935L8.39914 14.5528C8.26913 15.2782 7.86032 15.9239 7.26022 16.3518C6.66011 16.7796 5.91638 16.9555 5.1882 16.8418C3.63351 16.5918 2.59445 15.0684 2.86789 13.5137Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M9.24219 9.74963L14.9375 7.67932C15.0149 7.65073 15.0973 7.63776 15.1797 7.64116C15.2622 7.64455 15.3432 7.66426 15.418 7.69912C15.4928 7.73399 15.56 7.78333 15.6156 7.84429C15.6713 7.90526 15.7143 7.97664 15.7422 8.05432L17.2422 12.1637C17.2975 12.3191 17.2891 12.4901 17.2189 12.6394C17.1486 12.7887 17.0222 12.9041 16.8672 12.9606L6.58594 16.7028"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
  <path
    d="M5.625 14.0625L5.78906 13.1406"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="1.5"
  />
</svg>
