module.exports = {
    withNextFun({...nextConfig} = {}) {
        return Object.assign({}, nextConfig, {
            webpack(config, options) {
                if (!options.defaultLoaders) {
                    throw new Error(
                        'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
                    )
                }

                config.module.rules.push({
                    test: /(\/pages\/)(.*)\.(js|jsx)/,
                    use: [
                        options.defaultLoaders.babel,
                        {
                            loader: require.resolve("./loader.js"),
                        }
                    ],
                })

                if (typeof nextConfig.webpack === 'function') {
                    return nextConfig.webpack(config, options)
                }

                return config
            }
        })
    }
}