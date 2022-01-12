<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";

  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/neurons");
    }
  });
</script>

<Layout>
  <section>
    <h1>Neurons</h1>

    <p>
      Earn rewards by staking your ICP in neurons. Neurons allow you to
      participate in governance on the Internet Computer by voting on Network
      Nervous System (NNS) proposals.
    </p>

    <p>
      Your principal id is "tpv2w-kr3vj-a3mac-wivgj-5mwwr-egoxz-vxdpg-oqul5-3oygd-derik-jqe"
    </p>
  </section>
</Layout>
