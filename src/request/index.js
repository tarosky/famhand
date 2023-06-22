/**
 * Request to GitHub API
 */

import { Octokit } from "@octokit/rest";
import { versionCompare, wpVersionFresh } from "../parser/index.js";
import fetch from 'node-fetch';

let token;

/**
 * Set token.
 *
 * @param {string} newToken
 */
export function setToken( newToken ) {
    token = newToken;
}

let octokitObj = null;
/**
 * Get octokit object.
 *
 * @returns {Octokit}
 */
const octokit = () => {
    if ( !octokitObj ) {
        octokitObj = new Octokit( {
            auth: token,
        } );
    }
    return octokitObj;
}

/**
 * Filter repositories.
 *
 * @param {string} tag             Tag to filter repository.
 * @param {string} owner           Owner of repository.
 * @param {boolean} isOrganization If true, owner is an organization.
 * @returns {Promise<Array>}
 */
export function getRepos( tag, owner, isOrganization = false ) {
    let query = 'topic:' + tag;
    if ( isOrganization ) {
        query += '+org:' + owner;
    } else {
        query += '+user:' + owner;
    }
    return octokit().request( '/search/repositories', {
        q: query,
        per_page: 100,
    } ).then( ( res ) => {
        return Promise.resolve( res.data.items );
    } );
}

/**
 * Ger repository's file content.
 *
 * @param {string} repo_name Repository name in "owner/repo" format.
 * @param {string} path      File path.
 * @returns {Promise<string>}
 */
export function getRepoFile ( repo_name, path ) {
    return octokit().request( '/repos/' + repo_name + '/contents/' + path, {
        headers: {
            Accept: 'application/vnd.github.raw',
        }
    } ).then( ( res ) => {
        return Promise.resolve( res.data );
    } );
}

export function createUpdateIssue() {
    return octokit().request( 'POST  /repos/{owner}/{repo}/issues', {
        owner: 'OWNER',
        repo: 'REPO',
        title: 'Found a bug',
        body: 'I\'m having a problem with this.',
        assignees: [
            'octocat'
        ],
        milestone: 1,
        labels: [
            'bug'
        ],
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    } );
}

/**
 * Get latest WordPress version.
 *
 * @see https://codex.wordpress.org/WordPress.org_API#Version_Check
 * @returns {Promise<string>}
 */
export function latestWpVersion() {
    const endpoint = 'https://api.wordpress.org/core/version-check/1.7/';
    return fetch( endpoint ).then( ( res ) => {
        return res.json();
    } ).then( ( json ) => {
        let current = '';
        for ( const wp of json.offers ) {
            if ( ! current ) {
                current = wp.version;
            } else if ( 0 < versionCompare( wp.version, current ) ) {
                current = wp.version;
            }
        }
        return Promise.resolve( current );
    } );
}

/**
 * Get WordPress versions.
 *
 * @returns {Promise<object>}
 */
function wpVersions() {
    const endpoint = 'https://api.wordpress.org/core/stable-check/1.0/';
    return fetch( endpoint ).then( ( res ) => {
        return res.json();
    } );
}

/**
 * Convert major version string like "4.6.0" to 46.
 *
 * @param {string} version Version number.
 * @returns {number}
 */
export function majorVersionToInt( version ) {
    const number = version.split( '.' );
    return number[0] * 10 + number[1] * 1;
}

/**
 * Get WordPress versions between oldest and latest.
 *
 * @param {string} oldest Version number. e.g. 4.0, 5.6.1
 * @param {string} latest Same as oldest, but "latest" is also availble.
 * @returns {Promise<string[]>}
 */
export function getVersionsBetween( oldest, latest = 'latest' ) {
    const versions = {};
    return wpVersions().then( ( versions) => {
        const latestVersions = [];
        const versionStore = {};
        for ( const version in versions ) {
            if ( ! versions.hasOwnProperty( version ) ) {
                continue;
            }
            const major = majorVersionToInt( version );
            if ( ! versionStore[major] ) {
                versionStore[major] = version;
            } else {
                const currentMinor = parseInt( versionStore[major].split( '.' )[2], 10 ) || 0;
                const newMinor = parseInt( version.split( '.' )[2], 10 );
                if ( currentMinor < newMinor ) {
                    versionStore[major] = version;
                }
            }
        }
        oldest = majorVersionToInt( oldest );
        for ( const key in versionStore ) {
            if ( ! versionStore.hasOwnProperty( key ) ) {
                continue;
            }
            const major = majorVersionToInt(  versionStore[key] );
            if ( major < oldest ) {
                continue;
            }
            if ( 'latest' !== latest && major > majorVersionToInt( latest ) ) {
                continue;
            }
            latestVersions.push( versionStore[key] );
        }
        return latestVersions;
    } );
}


/**
 * Get WordPress version status.
 *
 * @see https://codex.wordpress.org/WordPress.org_API#Version_Stability
 * @param {string} version Version string.
 * @returns {Promise<string>}
 */
export function wpVersionStatus( version ){
    version = version.replace( /^(\d+\.\d+)\.0$/, '$1' );
    return wpVersions().then( ( json ) => {
        return Promise.resolve( json[version] || 'undefined' );
    } );
}

/**
 * Check if WordPress version is insecure.
 *
 * @param {string} version Version number to check.
 * @returns {Promise<boolean>}
 */
export function isWpVersionSecure ( version ) {
    return wpVersionStatus( version ).then( ( status ) => {
        return Promise.resolve( 'insecure' !== status );
    } );
}

