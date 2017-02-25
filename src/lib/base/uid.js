let counter = Math.floor(Math.random() * 2147483648);

/**
 * Returns a unique identifier string, which is an auto-incremented
 * base-36 counter.
 *
 * @return {string}
 */
const getUid = () => (counter++).toString(36);

export default getUid;
