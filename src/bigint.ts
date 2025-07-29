import { Buffer } from 'buffer';
import { blob, Layout } from '@solana/buffer-layout';
import { toBigIntBE, toBigIntLE, toBufferBE, toBufferLE } from 'bigint-buffer';
import { encodeDecode } from './base';

// https://github.com/no2chem/bigint-buffer/issues/59
function assertValidBigInteger(untrustedInput: unknown): asserts untrustedInput is bigint {
    if (typeof untrustedInput !== 'bigint') {
        throw new Error('Expected a `BigInt`');
    }
}

function bigInt_IMPL(littleEndian: boolean, length: number) {
    return (property?: string): Layout<bigint> => {
        const layout = blob(length, property);
        const { encode, decode } = encodeDecode(layout);

        const bigIntLayout = layout as Layout<unknown> as Layout<bigint>;

        bigIntLayout.decode = (buffer: Buffer, offset: number) => {
            const src = decode(buffer, offset);
            return littleEndian ? toBigIntLE(Buffer.from(src)) : toBigIntBE(Buffer.from(src));
        };

        bigIntLayout.encode = (bigInt: bigint, buffer: Buffer, offset: number) => {
            assertValidBigInteger(bigInt);
            let src;
            if (length === 0) {
                // https://github.com/no2chem/bigint-buffer/issues/40
                // `toBuffer{BE|LE}` crashes when passed zero for the `length` argument.
                src = Buffer.alloc(0);
            } else {
                src = littleEndian ? toBufferLE(bigInt, length) : toBufferBE(bigInt, length);
            }
            return encode(src, buffer, offset);
        };

        return bigIntLayout;
    };
}

export const bigInt = /* @__PURE__ */ bigInt_IMPL.bind(null, /* littleEndian */ true);

export const bigIntBE = /* @__PURE__ */ bigInt_IMPL.bind(null, /* littleEndian */ false);

export const u64 = /* @__PURE__ */ bigInt(8);

export const u64be = /* @__PURE__ */ bigIntBE(8);

export const u128 = /* @__PURE__ */ bigInt(16);

export const u128be = /* @__PURE__ */ bigIntBE(16);

export const u192 = /* @__PURE__ */ bigInt(24);

export const u192be = /* @__PURE__ */ bigIntBE(24);

export const u256 = /* @__PURE__ */ bigInt(32);

export const u256be = /* @__PURE__ */ bigIntBE(32);
