import * as Express from 'express';

const PORT = process.env.PORT || 8081;
const HOST = process.env.HOST || '0.0.0.0';
const app = Express();

app.disable('x-powered-by');
app.use('/', Express.static('static'));
app.use('/dist/', Express.static('dist/public'));

process.on('unhandledRejection', function unhandledRejectionHandler(reason, promise) {
	console.error("Unhandled rejection at:\n", promise, "\n\nReason: ", reason);
	process.exit(1);
});

app.listen(+PORT, HOST, function onAppStart() {
	console.log(`==> Server @ http://${HOST}:${PORT}`);
});

