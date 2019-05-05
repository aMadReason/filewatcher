const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const chalk = require('chalk');

/**
You can run this from the folder it's in using: 

    node index.js ~/Desktop/filewatch/test 

'~/Desktop/filewatch/test' can be any path to a folder or file that needs to be watched, or a file.

To close watcher: ctrl+C on windows

 */
 
const r = txt => chalk.bgRed.white(txt);
const g = txt => chalk.green(txt);
const b = txt => chalk.blue(txt);
const y = txt => chalk.yellow(txt);

// gets the path from argument
const args = process.argv.slice(2);
const watchpath = path.resolve(args[0]);

// sets up the watcher
const watcher = chokidar.watch(watchpath, {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  // do nothing
});

// log start message
console.log(`

Beholder is watching...

`);

watcher.on('change', path => {

  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) throw err;

    //console.log('beholders are win');

    const matches = data.match(new RegExp(/[^{\}]+(?=})/g));
    const filtered = matches.map(i => {
      try {
        const object = JSON.parse(`{${i}}`)
        return (object.eventid === 'cowrie.login.failed') ? object : null;
      } catch(e) {
        return null; // do nothing is bad data        
      }
    }).filter(i => i); // filter out nulls
    
    const last = filtered.pop(); // get the last line

    //console.log(last);

    try {   

      const { eventid,  username,  timestamp,  message,  src_ip,  session,  password,  sensor } = last;

      if (eventid && username && timestamp && message && src_ip && session && password && sensor) {

        // formats log message
        const messageArr = [
          ((last.message.includes('failed')) && r(` 😠  FAILED `) || null),
          `login from ${b(last.src_ip)} for user ${y(last.username)} with pwd ${y(last.password)} @ ${g(last.timestamp)}`,
        ];
        const msg = messageArr.filter(i => i).join(' ');

        // logs the line to console
        console.log(msg);   

      }    

    } catch(e) {
      // console.log('OH NOOOOOOO 😱', e)
      return;
    }
    
});

})
