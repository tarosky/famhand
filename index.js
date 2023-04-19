/**
 * Entry file for node scripts
 */

const { Octokit } = require("@octokit/rest");
const fs = require("fs");

const token = fs.readFileSync("github.token", "utf-8").trim();

const tag = 'wordpress-plugin-ga';

const octokit= new Octokit( {
	auth: token,
} );

const getRepos = ( tag ) => {
	return octokit.request( '/search/repositories', {
		q: "topic:" + tag,
	} ).then( ( res ) => {
		return Promise.resolve( res.data.items );
	} );
};

getRepos( tag ).then( ( repos) => {
	repos.forEach( ( repo ) => {
		const lastPushed = new Date( repo.pushed_at );
		const now = new Date();
		const diff = now - lastPushed;
		const days = Math.floor( diff / ( 1000 * 60 * 60 * 24 ) );
		console.log( repo.name, days );
	} );
} ).catch( ( res ) => {
	console.error( res );
} )
