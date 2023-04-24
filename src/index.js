/**
 * Entry file for node scripts
 */

import fs from 'fs';
import { homedir } from 'os';

import {parseReadme, wpVersionFresh, fermentationDays } from "./parser";
import { getRepoFile, getRepos, latestWpVersion, setToken } from "./request";

/**
 * Try to get token.
 *
 * 1. Project root directory. not recommended.
 * 2. Home directory.
 * 3. Environment variable "FARMHAND_GITHUB_TOKEN".
 *
 * @returns {string}
 */
const tryToken = () => {
    // If file exists, return the content.
    [
        'github.token',
         homedir() + '/',
    ].forEach( ( file ) => {
        if ( fs.existsSync( file ) ) {
            return fs.readFileSync( file, 'utf-8' ).trim();
        }
    } );
    // If files not exist, try environment variable.
    return process.env.FARMHAND_GITHUB_TOKEN || '';
};

/**
 * Get WordPress repositories.
 * @param {string}  owner
 * @param {string}  topic       Tag to filter repository.
 * @param {boolean} isOrganizer If true, owner is an organization.
 * @param {string}  token       Token.
 * @returns {Promise<Array<{tested_up_to: null, requires_php: null, pushed_at, name, fermentation_days, id, readme: boolean, fresh: boolean, requires_at_least: null}>>}
 */
export default function wpRepos( owner, topic, isOrganizer = true, token = '' ) {
    if ( '' === token ) {
        token = tryToken();
    }
    // Setup token.
    setToken( token );
    // Check newest WP Version.
    return latestWpVersion().then( latestWp =>{
        // Get repos.
        return getRepos( topic, owner, isOrganizer ).then( ( repos ) => {
            return Promise.allSettled( repos.map( repo => {
                let result = {
                    id: repo.id,
                    name: repo.full_name,
                    pushed_at: repo.pushed_at,
                    tested_up_to: null,
                    requires_php: null,
                    requires_at_least: null,
                    readme: false,
                    topics: repo.topics,
                    fermentation_days: fermentationDays( repo.pushed_at ),
                    fresh: false,
                };
                return getRepoFile( repo.full_name, 'README.md' ).then( file => {
                    result.readme = true;
                    const params = parseReadme( file );
                    result = Object.assign( result, params );
                    if ( result.tested_up_to ) {
                        result.fresh = wpVersionFresh( result.tested_up_to, latestWp, 3 );
                    }
                    return Promise.resolve( result );
                } ).catch( () => {
                    // No README.
                    return Promise.resolve( result );
                } );
            } ) ).then( results => {
                return Promise.resolve( results.map( r => r.value ) );
            } );
        } );
    } );
}
