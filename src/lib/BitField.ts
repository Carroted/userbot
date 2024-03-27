type BitFieldResolvable = number | string | bigint | BitField | BitFieldResolvable[];

/** Inspired by the Discord.js BitField class */

export default class BitField {
    static DefaultBit = 0;

    /**
 * Resolves bitfields to their numeric form.
 * @param {BitFieldResolvable} [bit] bit(s) to resolve
 * @returns {number|bigint}
 */
    static resolve(bit: BitFieldResolvable) {
        const { DefaultBit } = this;
        if (typeof DefaultBit === typeof bit && (bit as number) >= DefaultBit) return bit;
        if (bit instanceof BitField) return bit.bitfield;
        if (Array.isArray(bit)) {
            return bit.map(bit_ => this.resolve(bit_)).reduce((prev, bit_) => prev | bit_, DefaultBit);
        }
        if (typeof bit === 'string') {
            if (!isNaN(bit)) return typeof DefaultBit === 'bigint' ? BigInt(bit) : Number(bit);
            if (this.Flags[bit] !== undefined) return this.Flags[bit];
        }
        throw new DiscordjsRangeError(ErrorCodes.BitFieldInvalid, bit);
    }
}