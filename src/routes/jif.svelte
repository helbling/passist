<script>
	import { useLocalStorage } from '../components/passist.js';

	let jif;

	if (useLocalStorage)
		jif = JSON.parse(localStorage.getItem('jif', null));
</script>

<pre>{JSON.stringify(jif, null, 2)}</pre>
