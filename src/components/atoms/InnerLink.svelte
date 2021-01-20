<script lang="ts">
  export let active: boolean;
  export let label: string;
  export let linkTo: string;
</script>

<li>
  <a class={active ? "active" : undefined} href={linkTo}>{label}</a>
</li>

<style>
  a {
    color: white;
  }
  .active {
    font-weight: bolder;
  }
</style>
