#!/usr/bin/env node
// cover zim folder to atom-note
'use strict';
require('shelljs/global');
var path = require("path");
var walk = require("walk");
var fs   = require("fs");

if(process.argv[2] && process.argv[3]){
  var srcDir = path.normalize(process.argv[2]);
  var destDir = path.normalize(process.argv[3]);
  cover(srcDir,destDir);
}else{
  console.log("Usage: node main.js srcDir destDir");
}

function cover(srcDir,destDir){
  try {
    fs.statSync(destDir);
    console.log('destDir is existed!');
    process.exit();
  } catch (e) {
    cp('-R',srcDir+'/*',destDir);
  }

  var walker = walk.walk(destDir,{"filters":['.zim','.git','notebook.zim']});
  walker.on('file',function(root,fileStats,next){
    if(path.extname(fileStats.name) == '.txt'){
      var filePath = path.resolve(root,fileStats.name);
      fs.readFile(filePath,'utf-8',function(err,data){
        var mdContent = coverFile(data);
        fs.writeFileSync(filePath,mdContent);

        var newFilePath = path.resolve(root,path.basename(fileStats.name,'.txt')+'.md');
        fs.renameSync(filePath,newFilePath);

        next();
      });
    }
    next();
  });
}

function coverFile(content){
  // cover meta info
  content = content.replace(/^([\s\S]*?)(\r\n\r\n|\r\r|\n\n)/,"---\n$1\n---\n\n");
  content = content.replace(/Content-Type:.*(\r\n|\r|\n)/,'');
  content = content.replace(/Wiki-Format:.*(\r\n|\r|\n)/,'');
  content = content.replace(/Creation-Date:(.*)/,'date:$1');

  // cover heading
  content = content.replace(/^======\s+(.*?)\s*======/mg,"# $1");
  content = content.replace(/^=====\s+(.*?)\s*=====/mg,"## $1");
  content = content.replace(/^====\s+(.*?)\s*====/mg,"### $1");
  content = content.replace(/^===\s+(.*?)\s*===/mg,"#### $1");
  content = content.replace(/^==\s+(.*?)\s*==/mg,"##### $1");
  content = content.replace(/^=\s+(.*?)\s*=/mg,"###### $1");

  //cover link
  content = content.replace(/\[\[(.*)\|(.*)\]\]/gm,'[$1]($2)');
  content = content.replace(/\[\[(.*)\]\]/gm,'[$1]($1)');

  // cover todo
  content = content.replace(/^(\s*)\[[ x]\]/mg,'$1- [ ]');
  content = content.replace(/^(\s*)\[\*\]/mg,'$1- [x]');
  return content;
}
