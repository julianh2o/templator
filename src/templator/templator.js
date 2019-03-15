#! /usr/bin/env node
let path = require("path");
let fs = require("fs");
let fse = require("fs-extra");

let templateFolder = path.dirname(__dirname);
let cwd = process.cwd();

let cmd = process.argv[2];
let cmds = {
    "init":(template,dest) => {
        if (!template || !dest) {
            return console.log("Please include a template and a project name");
        }
        let templatePath = path.join(templateFolder,template);
        if (!fs.statSync(templatePath)) {
            console.log("Template not found: "+template);
            return;
        }

        let destinationPath = path.join(cwd,dest);
        fse.copySync(templatePath,destinationPath);
        console.log("Successfully created project "+path.basename(destinationPath));
    },
    "list":() => {
        let templates = fs.readdirSync(templateFolder);
        console.log("Available templates: ");
        for (t of templates) {
            if (t !== "templator") console.log("  "+t);
        }
    },
};

let args = process.argv.slice(3);
cmds[cmd](...args);
