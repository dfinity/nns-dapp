<!-- source: DFINITY foundation -->
<script lang="ts">
  interface Props {
    size?: string | number;
  }

  // Default to 100% size to make sure Safari renders the SVG correctly
  let { size = "100%" }: Props = $props();
</script>

<svg
  fill="none"
  height={size}
  viewBox="0 0 144 144"
  width={size}
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    fill="#436FF5"
    height="102.698"
    opacity="0.2"
    rx="18.0713"
    transform="rotate(7 35.354 20.0669)"
    width="102.698"
    x="35.354"
    y="20.0669"
  />
  <rect
    fill="url(#paint0_linear_2_6638)"
    fill-opacity="0.4"
    height="79.062"
    rx="18.2338"
    transform="rotate(-6.73734 9.54785 49.604)"
    width="76.0212"
    x="9.54785"
    y="49.604"
  />
  <rect
    fill="url(#paint1_linear_2_6638)"
    height="69.9394"
    rx="16"
    transform="rotate(-6.73734 8.31201 65.0596)"
    width="91.2254"
    x="8.31201"
    y="65.0596"
  />
  <rect
    fill="url(#paint2_linear_2_6638)"
    height="24.3268"
    rx="12.1634"
    transform="rotate(-6.73734 67.8301 76.4004)"
    width="39.531"
    x="67.8301"
    y="76.4004"
  />
  <rect
    fill="url(#paint3_linear_2_6638)"
    height="12.1634"
    rx="6.08169"
    transform="rotate(83.2627 86.6621 80.2998)"
    width="12.1634"
    x="86.6621"
    y="80.2998"
  />
  <defs>
    <linearGradient
      id="paint0_linear_2_6638"
      gradientUnits="userSpaceOnUse"
      x1="-93.498"
      x2="63.4409"
      y1="22.7993"
      y2="-0.191148"
    >
      <stop stop-color="#AFC3FF" stop-opacity="0" />
      <stop offset="1" stop-color="#1851FF" />
    </linearGradient>
    <linearGradient
      id="paint1_linear_2_6638"
      gradientUnits="userSpaceOnUse"
      x1="8.31201"
      x2="112.585"
      y1="36.4062"
      y2="72.9954"
    >
      <stop stop-color="#C4D3FF" />
      <stop offset="1" stop-color="#003FFF" />
    </linearGradient>
    <linearGradient
      id="paint2_linear_2_6638"
      gradientUnits="userSpaceOnUse"
      x1="67.8301"
      x2="110.436"
      y1="66.434"
      y2="85.0597"
    >
      <stop stop-color="#C4D3FF" />
      <stop offset="1" stop-color="#003FFF" />
    </linearGradient>
    <linearGradient
      id="paint3_linear_2_6638"
      gradientUnits="userSpaceOnUse"
      x1="98.2156"
      x2="96.8654"
      y1="83.2622"
      y2="94.6636"
    >
      <stop stop-color="#F9FAFF" />
      <stop offset="1" stop-color="#F7FBFF" stop-opacity="0" />
    </linearGradient>
  </defs>
</svg>
