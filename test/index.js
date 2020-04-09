
const kill = require('../'),
	assert = require('assert'),
	{fork} = require('child_process');

class Test {

	test1() {
		return new Promise((resolve) => {
			let p = fork('./test/fork');
			assert.ok(p.pid);

			p.on('exit', (code, signal) => {
				assert.ok(code || signal, 'should return an exit code');
				resolve();
			});
			kill(p.pid);
		});
	}

}

const error = setTimeout(() => {
	process.exit(1);
}, 30 * 1000);

const t = new Test();
t.test1().then(() => {
	clearTimeout(error);
}).catch((err) => {
	clearTimeout(error);
	throw err;
});
