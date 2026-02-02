const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	// Copy sql.js wasm file to dist folder
	const sqlWasmSrc = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
	const sqlWasmDest = path.join(__dirname, 'dist', 'sql-wasm.wasm');
	
	if (!fs.existsSync('dist')) {
		fs.mkdirSync('dist');
	}
	
	if (fs.existsSync(sqlWasmSrc)) {
		fs.copyFileSync(sqlWasmSrc, sqlWasmDest);
		console.log('Copied sql-wasm.wasm to dist folder');
	}

    // Copy webview folder to dist
    const webviewSrc = path.join(__dirname, 'src', 'webview');
    const webviewDest = path.join(__dirname, 'dist', 'webview');
    
    if (!fs.existsSync(webviewDest)) {
        fs.mkdirSync(webviewDest, { recursive: true });
    }
    
    if (fs.existsSync(webviewSrc)) {
        fs.readdirSync(webviewSrc).forEach(file => {
            const srcPath = path.join(webviewSrc, file);
            const destPath = path.join(webviewDest, file);
            if (fs.lstatSync(srcPath).isFile()) {
                fs.copyFileSync(srcPath, destPath);
            }
        });
        console.log('Copied webview files to dist folder');
    }

	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			esbuildProblemMatcherPlugin,
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
