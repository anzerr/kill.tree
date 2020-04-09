
const {spawn, exec} = require('child_process'),
	is = require('type.util'),
	{promisify} = require('util');

const getData = (process) => {
	return new Promise((resolve) => {
		const data = [];
		process.stdout.on('data', (d) => data.push(d));
		process.on('close', (code) => {
			resolve({code: code, data: Buffer.concat(data)});
		});
	});
};

class Kill {

	constructor() {
		this.tree = {};
		this.pid = {};
		this.killed = {};
	}

	getProcessList(pid) {
		if (process.platform === 'darwin') {
			return Promise.resolve(spawn('pgrep', ['-P', pid]));
		}
		return Promise.resolve(spawn('ps', ['-o', 'pid', '--no-headers', '--ppid', pid]));
	}

	getTree(parentPid) {
		return this.getProcessList(parentPid).then((process) => {
			return getData(process);
		}).then(({data}) => {
			const wait = [], ids = data.match(/\d+/g) || [];

			for (let i in ids) {
				const pid = parseInt(ids[i], 10);
				this.tree[parentPid].push(pid);
				this.tree[pid] = [];
				this.pid[pid] = true;
				wait.push(this.getTree(pid));
			}

			return Promise.all(wait);
		});
	}

	kill(tree, signal) {
		if (is.number(tree)) {
			try {
				process.kill(tree, signal);
				this.killed[tree] = true;
			} catch (err) {
				if (err.code !== 'ESRCH') {
					this.killed[tree] = false;
					throw err;
				}
				this.killed[tree] = true;
			}
		} else if (is.object(tree)) {
			for (let i in tree) {
				this.kill(parseInt(i, 10), signal);
				this.kill(tree[i], signal);
			}
			return;
		}
		throw new Error('can only kill a tree of pids or a pid');
	}

	run(pid, signal) {
		if (!is.number(pid)) {
			throw new Error('pid must be a number');
		}
		if (process.platform === 'win32') {
			return promisify(exec)(`taskkill /pid ${pid} /T /F`);
		}
		return this.getTree(pid).then(() => {
			return this.kill(this.tree, signal);
		});
	}

}

module.exports = (pid, signal) => {
	const k = new Kill();
	return k.run(pid, signal).then(() => {
		return {
			tree: this.tree,
			pid: this.pid,
			killed: this.killed
		};
	});
};
