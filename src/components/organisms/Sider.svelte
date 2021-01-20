<script>
  import InnerLinks from "../mocules/InnerLinks.svelte";
  import Profile from "../mocules/Profile.svelte";
</script>

<div class="sider">
  <Profile />
  <InnerLinks />
</div>

<style>
  .sider {
    position: fixed;
    width: 300px;
    height: 100%;
    background-color: #333;
  }
</style>
