<script>
	export let type = 'warning';
</script>

<style>
	div { padding:0.5em; margin-bottom:1em }
	.warning { background-color:#d1f3f8 }
	.error { background-color:#f8d5d0 }
</style>

<div class={type}>
	<slot/>
</div>
