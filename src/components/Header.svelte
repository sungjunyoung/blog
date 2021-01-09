<script>
    import { link } from "svelte-spa-router";
    import active from "svelte-spa-router/active";
</script>

<style>
    :global(header a.active) {
        font-weight: bold;
        text-decoration: underline;
    }
</style>

<header>
    <a href="/" use:link use:active>Home</a>
    <a href="/about" use:link use:active>About</a>
</header>
