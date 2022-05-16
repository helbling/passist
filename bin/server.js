import { handler } from '../build/handler.js';
import express from 'express';

const app = express();

app.use(express.static(
	'static',
	{
		setHeaders: (res, pathname, stats) => {
			res.set('access-control-allow-origin', '*');

			if (pathname.match(/\.jif$/))
				res.set('content-type', 'application/jif+json');
		}
	}
));

// let SvelteKit handle everything else, including serving prerendered pages
app.use(handler);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log('listening on port ' + port);
});
