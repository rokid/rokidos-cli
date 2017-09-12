const readline = require('readline');
const spawn = require('child_process').spawn;
const journalctl = spawn('journalctl', ['-f']);
const tagexpr = process.argv[2] ? process.argv[2].split(',') : false;

const stdout = readline.createInterface({
  input: journalctl.stdout
});

const stderr = readline.createInterface({
  input: journalctl.stderr
});

function mergeTail(arr) {
  return arr.slice(1).join(' ').trim();
}

function parseLine(line) {
  const sections = line.split('buildroot');
  const time = sections[0].trim();
  const body = mergeTail(sections);
  const parts = body.split(':');
  const tag = parts[0].replace(/\[[0-9]+\]/, '');
  const data = mergeTail(parts);
  return {
    raw: line,
    time,
    tag,
    data,
  };
}

function println(line) {
  console.log('\033[1;30m' + line.time + '\033[0m', 
    '\033[0;32m' + line.tag + '\033[0m',
    line.data);
}

function printAll(line) {
  console.log('\033[1;30m' + line.tag + '\033[0m', line.data);
}

stdout.on('line', (data) => {
  const line = parseLine(data);
  if (!tagexpr)
    printAll(line);
  else if (tagexpr.indexOf(line.tag) !== -1)
    println(line);
});

// stderr.on('line', (data) => {
//   const line = parseLine(data);
//   if (!tagexpr) 
//     printAll(line);
//   else if (tagexpr === line.tag)
//     println(line);
// });

journalctl.on('close', (code) => {
  console.error(`child process exited with code ${code}`);
});