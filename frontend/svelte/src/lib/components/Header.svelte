<script>
    import Logout from "./Logout.svelte";
</script>

<header>
    <img loading="lazy" role="presentation" alt="" src="/assets/assets/gradient.jpg" />
    <h3>NETWORK NERVOUS SYSTEM</h3>
    <Logout></Logout>
</header>

<style lang="scss">
    header {
      height: var(--header-bar-height);
      overflow: hidden;

      position: relative;
    }

    img {
      object-fit: cover;
      width: 100%;
    }

    h3 {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 50%;
      left: 50%;

      margin: 0;

      color: white;
      letter-spacing: 2.4px;
    }
</style>
