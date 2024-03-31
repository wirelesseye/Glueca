const INIT_CAPACITY = 1000000;

export default class DataBuffer {
    private capacity: number;
    private offset: number;
    private uint8Array: Uint8Array;
    private dataview: DataView;

    private textEncoder = new TextEncoder();
    private textDecoder = new TextDecoder();

    private constructor(capacity: number, uint8Array: Uint8Array) {
        this.capacity = capacity;
        this.uint8Array = uint8Array;
        this.offset = 0;
        this.dataview = new DataView(this.uint8Array.buffer);
    }

    static create() {
        return new DataBuffer(INIT_CAPACITY, new Uint8Array(INIT_CAPACITY));
    }

    static fromUint8Array(uint8Array: Uint8Array) {
        const dataBuffer = new DataBuffer(uint8Array.byteLength, new Uint8Array(uint8Array.byteLength));
        dataBuffer.uint8Array.set(uint8Array);
        return dataBuffer;
    }

    toUint8Array() {
        return this.uint8Array.subarray(0, this.offset);
    }

    private ensureSpace(byteLength: number) {
        while (this.offset + byteLength > this.capacity) {
            this.capacity *= 2;
        }
        const newUint8Array = new Uint8Array(this.capacity);
        newUint8Array.set(this.uint8Array);
        this.uint8Array = newUint8Array;
        this.dataview = new DataView(this.uint8Array.buffer);
    }

    putString(input: string, omitLength?: boolean) {
        const encoded = this.textEncoder.encode(input);
        if (!omitLength) {
            this.putI32(encoded.length);
        }
        this.ensureSpace(encoded.byteLength);
        this.uint8Array.set(encoded, this.offset);
        this.offset += encoded.byteLength;
    }

    getString(peek?: boolean, length?: number) {
        if (length === undefined) {
            length = this.getI32(peek);
        }
        const str = this.textDecoder.decode(
            this.uint8Array.subarray(this.offset, this.offset + length),
        );
        if (!peek) {
            this.offset += length;
        }
        return str;
    }

    putBoolean(input: boolean) {
        this.putI8(input ? 1 : 0);
    }

    getBoolean(peek?: boolean) {
        return this.getI8(peek) > 0;
    }

    putI8(input: number) {
        this.ensureSpace(1);
        this.dataview.setInt8(this.offset, input);
        this.offset += 1;
    }

    getI8(peek?: boolean) {
        const value = this.dataview.getInt8(this.offset);
        if (!peek) {
            this.offset += 1;
        }
        return value;
    }

    putI32(input: number) {
        this.ensureSpace(4);
        this.dataview.setInt32(this.offset, input);
        this.offset += 4;
    }

    getI32(peek?: boolean) {
        const value = this.dataview.getInt32(this.offset);
        if (!peek) {
            this.offset += 4;
        }
        return value;
    }

    putF32(input: number) {
        this.ensureSpace(4);
        this.dataview.setFloat32(this.offset, input);
        this.offset += 4;
    }

    getF32(peek?: boolean) {
        const value = this.dataview.getFloat32(this.offset);
        if (!peek) {
            this.offset += 4;
        }
        return value;
    }

    putF64(input: number) {
        this.ensureSpace(8);
        this.dataview.setFloat64(this.offset, input);
        this.offset += 8;
    }

    getF64(peek?: boolean) {
        const value = this.dataview.getFloat64(this.offset);
        if (!peek) {
            this.offset += 8;
        }
        return value;
    }

    async putBlob(input: Blob) {
        const arrayBuffer = await input.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.putI32(uint8Array.byteLength);
        this.ensureSpace(uint8Array.byteLength);
        this.uint8Array.set(uint8Array, this.offset);
        this.offset += uint8Array.byteLength;
    }

    getBlob() {
        const length = this.getI32();
        const uint8Array = this.uint8Array.subarray(
            this.offset,
            this.offset + length,
        );
        this.offset += length;
        return new Blob([uint8Array]);
    }
}
