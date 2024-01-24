import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import envCompatible from 'vite-plugin-env-compatible';

export default ({ mode }) => {
    process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

    return defineConfig({
        define: {
            'process.env': process.env
        },
        envPrefix: 'REACT_APP_',
        plugins: [react(), viteTsconfigPaths(), envCompatible()],
        server: {
            host: "0.0.0.0",
            port: parseInt(process.env.PORT || "3000"),
        },
        build: {
            outDir:"build",
        },
        // js files support, taken from:
        // https://github.com/vitejs/vite/discussions/3448#discussioncomment-749919
        esbuild: {
            loader: 'tsx',
            include: /src\/.*\.[tj]sx?$/,
            exclude: [],
            sourcemap: true,
        },
    });
}