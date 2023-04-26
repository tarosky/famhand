/**
 * Test request module.
 */

import { isWpVersionSecure, latestWpVersion } from '../index.js';
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
});
