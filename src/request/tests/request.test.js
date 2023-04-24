/**
 * Test request module.
 */

const request = require('../index');
const { versionCompare } = require( "../../parser" );

describe('Test WP API:', () => {

    test('Check Old WP version is insecure', () => {
        expect.assertions( 1 );
        return request.isWpVersionSecure( '6.0.0' ).then( (res) => {
            expect( res ).toBe( false );
        } );
    });

    test('Check latest WP version:', () => {
        expect.assertions( 1 );
        return request.latestWpVersion().then( (latest) => {
            expect( versionCompare(latest, '6.0' ) ).toBe( 1 );
        } );
    } );
});
