/**
 * Unit test for file parser.
 */

const parser = require('../index');
const fs = require('fs');

describe('Test Parsing Utilities:', () => {
	test('Extract README.md info', () => {
		// Get readme.
		const readme = fs.readFileSync(__dirname + '/README.md' ).toString();
		const params = parser.parseReadme( readme );
		expect( params.requires_at_least ).toBe( '5.9' );
		expect( params.requires_php).toBe( '7.2' );
		expect( params.tested_up_to).toBe( '6.1' );
	});

	test('Confirm date string working', () => {
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate( threeDaysAgo.getDate() - 3 );
		const ferminated = parser.fermentationDays( threeDaysAgo.toISOString() );
		expect( ferminated ).toBe( 3 );
	} );

	test('Check version parser', () => {
		expect( parser.extractMajorWpVersion( '6.2.0' ) ).toBe( 62 );
		expect( parser.extractMajorWpVersion( '6.1' ) ).toBe( 61 );
		expect( parser.extractMajorWpVersion( '5.9.3' ) ).toBe( 59 );
	} );

	test('Version freshness chekc', () => {
		expect( parser.wpVersionFresh( '6.0', '6.2.0' ) ).toBe( true );
		expect( parser.wpVersionFresh( '5.9', '6.2' ) ).toBe( false );
	} );

    test( 'Version compare', () => {
        expect( parser.versionCompare( '6.2', '6.2.0' ) ).toBe( 0 );
        expect( parser.versionCompare( '6.2', '6.2.1' ) ).toBe( -1 );
        expect( parser.versionCompare( '6.1.2', '5.9' ) ).toBe( 1 );
        expect( parser.versionCompare( '6', '4.8.23' ) ).toBe( 1 );
    } );
});
