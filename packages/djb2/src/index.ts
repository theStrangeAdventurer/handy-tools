/**
 * The DJB2 hash function is a popular hashing algorithm
 * used in computer science for generating hash values from strings.
 * 
 * @param {string} str 
 * @returns {number}
 */
export function djb2(str: string): number {
    let hash = 5381; // 5381 is a prime number, empirically chosen
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + charCode; // bitwise left shift by 5 bits
    }
    return hash >>> 0; // convert to unsigned 32-bit integer
}