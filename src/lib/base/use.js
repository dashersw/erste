/**
 * @typedef {{$$register: Function}}
 */
const ErstePlugin = null

/**
 * @param {ErstePlugin} plugin An erste plugin to install and use. Its `$$register`
 * method will be called with erste as the first parameter, allowing it to
 * modify the erste module freely. One common use case is the regie npm 
 * library, which is the state management solution for vanilla JavaScript 
 * applications and erste. It injects the store into root of erste and allows
 * Components to have a special syntax to declare observations for state
 * properties.
 */
export default function(plugin) {
    plugin.$$register(this)
}
