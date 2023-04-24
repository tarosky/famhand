/**
 * Parse README.md file and extract param.
 */


/**
 * Parse README.md file and extract param.
 * @param readme
 * @returns {{tested_up_to: null, requires_php: null, requires_at_least: null}}
 */
module.exports.parseReadme = ( readme ) => {
	const params = {
		requires_at_least: null,
		requires_php: null,
		tested_up_to: null,
	};
	// Split into lines.
	const lines = readme.split( /(\r\n|\n|\r)/ );
	// Search prop
	for ( const line of lines ) {
		for ( const prop in params ) {
			if ( ! Object.prototype.hasOwnProperty.call( params, prop ) ) {
				continue;
			}
			const match = line.match( new RegExp( prop.replace( /_/g, ' ') + ':\\s*(.*)$', 'i' ) );
			// Parser line.
			if ( match ) {
				params[ prop ] = match[ 1 ].trim();
				break;
			}
		}
	}
	return params;
}

/**
 * Get days since last pushed.
 *
 * @param {string} date Datetime string.
 * @returns {number}
 */
module.exports.fermentationDays = ( date ) => {
	const lastPushed = new Date( date );
	const now = new Date();
	const diff = now - lastPushed;
	return Math.floor( diff / ( 1000 * 60 * 60 * 24 ) );
}

/**
 * get version string.
 *
 * @param {string} version Version string.
 * @return {number} Integer like 62
 */
module.exports.extractMajorWpVersion = ( version ) => {
	const digits = version.split( '.');
	return parseInt( [ digits[0], digits[1] || 0 ].join( '' ), 10 );
};

/**
 * Is WordPress version fresh?
 *
 * @param {string} version    Version to test.
 * @param {string} latest     Latest version of WordPress
 * @param {number} acceptable Acceptable version difference. Default is 3.
 */
module.exports.wpVersionFresh = ( version, latest, acceptable = 3 ) => {
	const versionNum = this.extractMajorWpVersion( version );
	const latestNum = this.extractMajorWpVersion( latest );
	return latestNum - versionNum < acceptable;
}

/**
 * Compare 2 versions and return PHP version compare style.
 *
 * @param {string} version Version string.
 * @param {string} target  Targeet version.
 * @return {number} -1 is lower than target, 0 is same, 1 is higher than target
 */
module.exports.versionCompare = ( version, target ) => {
    const versionNum = version.split( '.' ).map( int => parseInt( int, 10 ) );
    const targetNum  = target.split( '.' ).map( int => parseInt( int, 10 ) );
    for ( const v of [ versionNum, targetNum ] ) {
        const limit = v.length;
        for ( let i = 0; i < 3 - limit; i++ ) {
            v.push( 0 );
        }
    }
    for ( let i = 0; i < 3; i++ ) {
        if ( versionNum[i] === targetNum[i] ) {
            continue;
        }
        return versionNum[i] > targetNum[i] ? 1 : -1;
    }
    // Here, everything is same;
    return 0;
}
