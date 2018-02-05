#!/usr/bin/env node

// Setup.

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const spawn = require('child_process').spawn;
const spawnSync = require('child_process').spawnSync;

const VERSION = "0.10.1"
var ADB = ""
var NODE_PATH = 'NODE_PATH=' + path.posix.join('/', 'usr', 'lib', 'node_models');
var TMP_DIR = path.posix.join('/', 'tmp');

function display_help() {
  console.log(`
Usage: rokid [command]

rokid help          Get helps
rokid search        Search your devices and configuring network
rokid devices       List connected devices
rokid run [file]    Run scripts on device
rokid shell         <command> Wait for an connectable device and shell
rokid test <dir>    Run tests on your device
rokid log <filter>  Show the logs of connected device by comma-based filter

rokid@${VERSION}`);
}

function display_version() {
  console.log(`rokid@${VERSION}`);
}

function get_cli_root() {
  return path.resolve(__dirname, '..');
}

// 执行纯属脚本时使用
function exec_go(command, callback) {
  let ch = exec(command.join(' '));
  process.stdin.pipe(ch.stdin);
  ch.stdout.pipe(process.stdout);
  ch.stderr.pipe(process.stdout);
}

function execSync_go(command, callback) {
  let ch = execSync(command.join(' '));
  console.log(ch.toString().trim());
}

function spawn_go(command, callback) {
  spawn(command[0], command.slice(1), {
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  });
}

// 带有流输出时使用
function spawnSync_go(command, callback) {
  let ch = spawnSync(command[0], command.slice(1), {
    stdio: [
      process.stdin,
      process.stdout,
      process.stderr
    ]
  });
  if (callback) callback();
  return ch;
}

function run_exec(command, callback) { // TODO: I don't know which child_process is the best choice or choicing function by command execute file type.
  // console.log(command.join(' '));
  return spawnSync_go(command, callback);
}

function init_adb() {
  if (process.env.hasOwnProperty('ROKIDOS_CLI_ADB_PATH') &&
    process.env['ROKIDOS_CLI_ADB_PATH']) {
    ADB = process.env['ROKIDOS_CLI_ADB_PATH'];
  } else {
    ADB = path.join(get_cli_root(), 'tools', 'adb');
  }
  console.log('use adb:', ADB);
}

function build_rpp() {
  let config = path.join(get_cli_root(), 'webpack.config.js');
  execSync_go([
    path.join(get_cli_root(), 'node_modules', '.bin', 'webpack'),
    '--config',
    config
  ]);

  execSync_go([
    'node',
    path.join(get_cli_root(), 'postbuild.js')
  ]);
}

function log(filter) {
  // change the workdir to source dir
  process.chdir(get_cli_root());
  run_script(path.join('lib', 'log-filter.js'), filter);
}

function install_rpp(rpp_path) {
  if (!rpp_path || rpp_path.length <= 0) {
    build_rpp();
    fs.readdirSync(process.cwd()).forEach(function (file) {
      if (file.search(/\.rpp/i) > 0) {
        rpp_path = file
      }
    })
  }
  run_exec([ADB, 'shell', 'mkdir', '-p', path.posix.join(TMP_DIR, 'installers')]);
  run_exec([ADB, 'push', rpp_path, path.posix.join(TMP_DIR, 'installers')]);
  run_exec([ADB, 'shell', 'pkgm-install', rpp_path]);
  console.log("\033[32m$rpp_path installed\033[0m\n");
}

function run_script(filename, param) {
  if (filename) filename = path.normalize(filename);
  let filename_remote = path.posix.join(TMP_DIR, ...filename.split(path.sep));
  run_exec([ADB, 'push', filename, filename_remote]);
  run_exec([ADB, 'shell', NODE_PATH, 'node', filename_remote, param ? param : '']);
  run_exec([ADB, 'shell', 'rm', filename_remote]);
}

function run_test(dir) {
  let testdir = path.posix.join(TMP_DIR, 'tests');
  // create test directory
  run_exec([ADB, 'shell', 'mkdir', '-p', testdir]);
  run_exec([ADB, 'push', 'tests', testdir]);
  // # change the workdir to source dir
  run_exec([ADB, 'push', path.join(get_cli_root(), 'lib'), testdir]);
  run_exec([ADB, 'shell', 'node', path.posix.join(testdir, 'lib', 'executor.js'), dir ? dir : '']);
  run_exec([ADB, 'shell', 'rm', '-r', testdir]); // TODO: not work, I think it should add a key bind.
}

function debug_mode() {
  run_exec([ADB, 'shell', 'killall', '-9', 'ams']);
  run_exec([ADB, 'shell', 'killall', '-9', 'node']);
  run_exec([ADB, 'shell', NODE_PATH, 'ams']);
}

function adb_commands(action, param) {
  init_adb();
  run_exec([ADB, 'wait-for-device'], function () {});
  switch (action) {
    case 'devices':
    case 'shell':
      run_exec([ADB, action]);
      break;
    case 'node':
      run_exec([ADB, 'shell', NODE_PATH, 'node']);
      break;
    case 'search':
      exec_go(['rokid-search']);
      break;
    case 'log':
      log();
      break;
    case 'install':
      install_rpp(param);
      break;
    case 'build':
      build_rpp(param);
      break;
    case 'run':
      run_script(param);
      break;
    case 'test':
      run_test(param);
      break;
    case 'debug':
      debug_mode();
      break;
    case '-V':
    case '--version':
      display_version();
      break;
    default:
      display_help();
      break;
  }
}

adb_commands(process.argv[2], process.argv[3]);