/**
 * Unit test for file parser.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { parseReadme, fermentationDays, extractMajorWpVersion, wpVersionFresh, versionCompare } from '../index.js';
import { readFileSync } from 'fs';


// see: https://teno-hira.com/media/?p=1615
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe( 'Test Parsing Utilities:', () => {
    test( 'Extract README.md info', () => {
        // Get readme.

        const readme = readFileSync( __dirname + '/README.md' ).toString();
        const params = parseReadme( readme );
        expect( params.requires_at_least ).toBe( '5.9' );
        expect( params.requires_php ).toBe( '7.2' );
        expect( params.tested_up_to ).toBe( '6.1' );
    } );

    test( 'Confirm date string working', () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate( threeDaysAgo.getDate() - 3 );
        const ferminated = fermentationDays( threeDaysAgo.toISOString() );
        expect( ferminated ).toBe( 3 );
    } );

    test( 'Check version extracter', () => {
        expect( extractMajorWpVersion( '6.2.0' ) ).toBe( 62 );
        expect( extractMajorWpVersion( '6.1' ) ).toBe( 61 );
        expect( extractMajorWpVersion( '5.9.3' ) ).toBe( 59 );
    } );

    test( 'Version freshness check', () => {
        expect( wpVersionFresh( '6.0', '6.2.0' ) ).toBe( true );
        expect( wpVersionFresh( '5.9', '6.2' ) ).toBe( false );
    } );

    test( 'Version compare', () => {
        expect( versionCompare( '6.2', '6.2.0' ) ).toBe( 0 );
        expect( versionCompare( '6.2', '6.2.1' ) ).toBe( -1 );
        expect( versionCompare( '6.1.2', '5.9' ) ).toBe( 1 );
        expect( versionCompare( '6', '4.8.23' ) ).toBe( 1 );
    } );
} );
