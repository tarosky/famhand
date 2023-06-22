/**
 * Test request module.
 */

import { isWpVersionSecure, getVersionsBetween, latestWpVersion, majorVersionToInt } from '../index.js';
import { versionCompare } from "../../parser/index.js";

describe('Test WP API:', () => {

    test('Check Old WP version is insecure', () => {
        expect.assertions( 1 );
        return isWpVersionSecure( '6.0.0' ).then( (res) => {
            expect( res ).toBe( false );
        } );
    });

    test('Check latest WP version:', () => {
        expect.assertions( 1 );
        return latestWpVersion().then( (latest) => {
            expect( versionCompare(latest, '6.0' ) ).toBe( 1 );
        } );
    } );

    test( 'Convert major version string to int', () => {
        expect( majorVersionToInt( '4.6.0' ) ).toBe( 46 );
        expect( majorVersionToInt( '5.9' ) ).toBe( 59 );
    } );

    test( 'Versions are never empty.' , () => {
        expect.assertions( 2 );
        return getVersionsBetween( '5.0', '6.0' ).then( ( versions ) => {
            expect( versions ).not.toBe( {} );
            expect( versions.length ).toBe( 11 );
        } );
    } );
});
