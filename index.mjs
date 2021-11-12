#!/usr/bin/env node

// Packr
// by Polycryptic

// Yargs
import Yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Packr
import { Packr } from "./packr/index.mjs";

// CLI
const CLI = Yargs(hideBin(process.argv)).scriptName("packr").usage("$0 <cmd> [args]");

CLI
    .command("pack [project] [entry] [minify]","Pack [project] into a single file starting from [entry].",(yargs) => {
        yargs.positional("project",{
            type: "string",
            default: ".",
            describe: "The project folder."
        });

        yargs.positional("entry",{
            type: "string",
            default: "main.lua",
            describe: "The entry point to your script."
        });    
        
        yargs.positional("minify",{
            type: "boolean",
            default: true,
            describe: "Minify the output."
        });    
    }, async function(argv) {
        await Packr(argv.project,argv.entry,argv.minify);
    });

CLI.help().argv;