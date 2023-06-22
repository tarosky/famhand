#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import decompress from 'decompress';
import argv from 'argv';
import { getVersionsBetween } from "./src/request/index.js";

argv.option([
    {
        name: 'oldest',
        short: 'o',
        type : 'string',
        description :'Oldest WordPress version to check. Default 5.0',
        example: "'wp-str-search --oldest=5.9' or 'farmhand -f readme.txt'"
    },
    {
        name: 'latest',
        short: 'l',
        type : 'string',
        description :'The latest WordPress major version to check. Default "latest".',
        example: "'wp-str-search --latest=6.2' or 'wp-str-search -l 6.2'"
    },
    {
        name: 'dir',
        short: 'd',
        type : 'string',
        description :'Working directory for downloading WordPress. Default "./tmp".',
        example: "'wp-str-search --dir=wp' or 'wp str-search -d wp'"
    }
]);

const options = argv.run();
const string = options.targets[0];
const oldest = options.options.oldest || '5.0';
const latest = options.options.latest || 'latest';
const dir = options.options.dir || './tmp';

// Force directory empty.
if ( fs.existsSync( dir ) ) {
    fs.rmSync( dir, { recursive: true } );
}
fs.mkdirSync( dir );

// Display status.
process.stdout.write( `Searching for "${ string }" in WordPress versions between ${ oldest } and ${ latest }.\n` );

/**
 * Search string in WordPress and get matched files.
 *
 * @param {string} version Full version string.
 * @param {string} dir     working Directory.
 * @param {string} str     String to search.
 * @return Promise<object[]>
 */
function downloadWpAndSearchInsideThat( version, dir, str ) {
    return new Promise( ( resolve, reject ) => {
        // First major verison is 6.0 and not like 6.0.0
        const url = 'https://wordpress.org/wordpress-' + ( version.replace( /(\d+\.\d+)\.0$/, '$1' ) ) + '.zip';
        https.get(url, (res) => {
            const path = dir + '/' + version + '.zip';
            const writeStream = fs.createWriteStream(path);

            res.pipe(writeStream);

            writeStream.on("finish", () => {
                writeStream.close();
                resolve( path );
            }).on( 'error', reject );
        })
            .on( "error", reject )
            .end();
    } ).then( path => {
        return decompress( path, dir + '/' + version );
    } ).then( files => {
        // Remove wp-content.
        fs.rmSync( dir + '/' + version + '/wordpress/wp-content', { recursive: true } );
        // Search files.
        return Promise.all( files.filter( file => {
            if ( 'file' !== file.type ) {
                return false;
            }
            if (  /wordpress\/wp-content\//.test( file.path ) ) {
                return false;
            }
            // Check extentions.
            return /\.(php|[jt]s|s?css|html)$/.test( file.path );
        } ).map( file => {
            return new Promise( ( resolve, reject ) => {
                fs.readFile( dir + '/' + version + '/' + file.path, 'utf-8', ( err, data ) => {
                    if ( err ) {
                        resolve( false );
                    } else if ( 0 > data.indexOf( str ) ) {
                        resolve( false );
                    } else {
                        resolve( file.path );
                    }
                } );
            } );
        } ) );
    } ).then( results => {
        results = results.filter( result => result );
        return {
            version,
            count: results.length,
            files: results,
        };
    } );
}

// Get versions.
getVersionsBetween( oldest, latest ).then( versions => {
    process.stdout.write( 'Downloading WordPress: ' + versions.join( ', ' ) + "...\n\n" );
    return Promise.all( versions.map( version => {
        return downloadWpAndSearchInsideThat( version, dir, string );
    } ) );
} ).then( wps => {
    console.table( wps );
} ).catch( e => {
    process.stdout.write( e );
} );
