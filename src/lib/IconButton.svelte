<script>
import Icon from './Icon.svelte';

export let type;
export let fill = false;
export let title = "";

</script>

<style>
	button {
		background: none;
		color: inherit;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		outline: inherit;
	}
</style>

<button class="{type}" on:click {title}>
	  <Icon {type} {fill} />
</button>



