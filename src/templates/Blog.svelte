<script>
  import Sider from "../components/organisms/Sider.svelte";
</script>

<svelte:head>
  <title>sungjunyoung's blog</title>
</svelte:head>

<div>
  <Sider />
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .content {
    position: absolute;
    left: 300px;
    padding: 16px;
  }
</style>
