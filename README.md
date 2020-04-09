
### `Intro`
![GitHub Actions status | publish](https://github.com/anzerr/kill.tree/workflows/publish/badge.svg)

Kill a tree of process for a given pid

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/kill.tree.git
npm install --save @anzerr/kill.tree
```

### `Example`
``` javascript
const kill = require('kill.tree');

kill(1, 'SIGKILL').then(({tree, pid, killed}) => {
    // failed to kill tree
}).catch(() => {
    // failed to kill tree
})
```