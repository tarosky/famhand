#!/usr/bin/env node

import fs from 'fs';
import argv from 'argv';
import { parseReadme, wpVersionFresh } from './src/parser/index.js';
import { latestWpVersion } from "./src/request/index.js";

argv.option([
    {
        name: 'file',
        short: 'f',
        type : 'string',
        description :'File to parse. Default README.md',
        example: "'farmhand--file=readme.txt' or 'farmhand -f readme.txt'"
    },
]);

const options = argv.run();

// Build readme.
const file = options.options.file || 'README.md';
let readme;
try {
    readme = fs.readFileSync( file, 'utf-8' ).toString();
    readme = parseReadme( readme );
    if ( ! readme.tested_up_to ) {
        throw new Error( 'NO version specified.' );
    }
} catch ( e ) {
    console.error( e );
    process.exit( 0 );
}

// Get current wp version.
latestWpVersion().then( version => {
    if ( ! wpVersionFresh( readme.tested_up_to, version ) ) {
        return Promise.resolve( `[UPDATE] Test Wordpress version from "${ readme.tested_up_to }" to "${ version }".` );
    } else {
        return Promise.reject( 'Version is secure.' );
    }
} ).then( msg => {
    console.log( msg );
    process.exit( 0 );
} ).catch( ( e ) => {
    console.error( e );
    process.exit( 0 );
} );
