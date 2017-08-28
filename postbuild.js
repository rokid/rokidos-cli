'use strict';

const cwd = process.cwd();
const fs = require('fs');
const uglify = require('uglify-es');
const pkgInfo = require(cwd + '/package.json');
const pkgName = pkgInfo.name.replace(/^(@rokid|@rokidapp)\//, '');
const pkgFullname = `${pkgName}@${pkgInfo.version}.rpp`;
const pkgSource = fs.readFileSync(`${cwd}/${pkgFullname}`, 'utf8');
const newSource = uglify.minify(`
  module.exports = {
    'package': ${JSON.stringify(pkgInfo)},
    'main': function() { ${pkgSource} },
  };
`);

if (newSource.error)
  throw newSource.error;

fs.writeFileSync(`${cwd}/${pkgFullname}`, newSource.code);
console.log(`generated the rpp at ${cwd}/${pkgFullname} ` +
            `with ${Math.floor(newSource.code.length / 1024)}KB`);
