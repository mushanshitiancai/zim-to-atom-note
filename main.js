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

  try {
    fs.statSync(destDir);
    console.log('destDir is existed!');
    process.exit();
  } catch (e) {
  }

  process.stdin.resume();
  process.stdout.write('input the note name: ');
  process.stdin.once('data',function(data){
    var noteName = data.toString().trim();
    process.stdout.write('input the author name: ');
    process.stdin.once('data',function (data) {
      process.stdin.pause();
      var author = data.toString().trim();

      cover(srcDir,destDir,noteName,author);
    })
  });
}else{
  console.log("Usage: node main.js srcDir destDir");
}

function cover(srcDir,destDir,noteName,author){
  try {
    fs.statSync(destDir);
    console.log('destDir is existed!');
    process.exit();
  } catch (e) {
    cp('-R',srcDir+'/*',destDir);

    var zimFilePath = path.join(destDir,'notebook.zim');
    ifExistedThenDo(zimFilePath,function(){
      rm(zimFilePath);
    });
  }

  // create a json file in the root of note folder
  createNoteJson(destDir,noteName,author);

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

function createNoteJson(folderPath,noteName,author){
  var jsonData = {
    "name"   : noteName,
    "author" : author,
    "format" : "atom-note-v0.01"
  };
  fs.writeFileSync(path.join(folderPath,'note.json'),JSON.stringify(jsonData,null,2));
}

function ifExistedThenDo(path,callback){
  try {
    var stats = fs.statSync(path);
    callback(stats);
  } catch (e) {
  }
}
