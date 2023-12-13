/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const APP_BUILD_DIR = path.resolve('dist');
const APP_SRC_DIR = path.resolve();

const OUTPUT_CONFIG = {
    path: APP_BUILD_DIR,
};

const TS_LOADER_RULE = {
    test: /\.tsx?$/,
    exclude: [/node_modules/, /dist/],
    include: [APP_SRC_DIR],
    loader: 'ts-loader',
};

const APP_CONFIG = {
    target: 'node',
    devtool: 'inline-source-map',
    entry: {
        'app': ['./src/index.ts']
    },
    resolve: {
        extensions: ['.ts', '.d.ts', '.tsx', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: './src/db/mydatabase.db', to: 'db' }
            ]
        })
    ],
    output: OUTPUT_CONFIG,
    module: { rules: [TS_LOADER_RULE] },
    externals: [webpackNodeExternals()],
};

module.exports = APP_CONFIG;
