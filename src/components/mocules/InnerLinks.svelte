<script lang="ts">
  import InnerLink from "../atoms/InnerLink.svelte";
</script>

<nav>
  <ul>
    <InnerLink active={true} label={"Home"} linkTo="." />
    <InnerLink active={false} label={"Blog"} linkTo="blog" />
  </ul>
</nav>

<style>
  nav {
    font-weight: 300;
    padding: 0 1em;
  }
</style>
