export default class DataBuffer {
    private buffer: number[];
    private offset: number;

    constructor() {
        this.buffer = [];
        this.offset = 0;
    }

    static fromUint8Array(uint8Array: Uint8Array) {
        const dataBuffer = new DataBuffer();
        dataBuffer.buffer = Array.from(uint8Array);
        return dataBuffer;
    }

    toUint8Array() {
        return new Uint8Array(this.buffer);
    }

    putString(input: string, omitLength?: boolean) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(input);
        if (!omitLength) {
            this.putI32(encoded.length);
        }
        encoded.forEach((byte) => this.buffer.push(byte), this);
    }

    getString(peek?: boolean, length?: number) {
        if (length === undefined) {
            length = this.getI32(peek);
        }
        const uint8Array = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            uint8Array[i] = this.buffer[this.offset + i];
        }
        if (!peek) {
            this.offset += length;
        }
        return new TextDecoder().decode(uint8Array);
    }

    putBoolean(input: boolean) {
        this.putI8(input ? 1 : 0);
    }

    getBoolean(peek?: boolean) {
        return this.getI8(peek) > 0;
    }

    putI8(input: number) {
        const arrayBuffer = new ArrayBuffer(1);
        new DataView(arrayBuffer).setInt8(0, input);
        this.buffer.push(...new Uint8Array(arrayBuffer));
    }

    getI8(peek?: boolean) {
        const arrayBuffer = new ArrayBuffer(1);
        const uint8Array = new Uint8Array(arrayBuffer);
        uint8Array[0] = this.buffer[this.offset];
        if (!peek) {
            this.offset += 1;
        }
        return new DataView(arrayBuffer).getInt8(0);
    }

    putI32(input: number) {
        const arrayBuffer = new ArrayBuffer(4);
        new DataView(arrayBuffer).setInt32(0, input);
        this.buffer.push(...new Uint8Array(arrayBuffer));
    }

    getI32(peek?: boolean) {
        const arrayBuffer = new ArrayBuffer(4);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < 4; i++) {
            uint8Array[i] = this.buffer[this.offset + i];
        }
        if (!peek) {
            this.offset += 4;
        }
        return new DataView(arrayBuffer).getInt32(0);
    }

    putF32(input: number) {
        const arrayBuffer = new ArrayBuffer(4);
        new DataView(arrayBuffer).setFloat32(0, input);
        this.buffer.push(...new Uint8Array(arrayBuffer));
    }

    getF32(peek?: boolean) {
        const arrayBuffer = new ArrayBuffer(4);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < 4; i++) {
            uint8Array[i] = this.buffer[this.offset + i];
        }
        if (!peek) {
            this.offset += 4;
        }
        return new DataView(arrayBuffer).getFloat32(0);
    }

    putF64(input: number) {
        const arrayBuffer = new ArrayBuffer(8);
        new DataView(arrayBuffer).setFloat64(0, input);
        this.buffer.push(...new Uint8Array(arrayBuffer));
    }

    getF64(peek?: boolean) {
        const arrayBuffer = new ArrayBuffer(8);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < 8; i++) {
            uint8Array[i] = this.buffer[this.offset + i];
        }
        if (!peek) {
            this.offset += 8;
        }
        return new DataView(arrayBuffer).getFloat64(0);
    }

    async putBlob(input: Blob) {
        const arrayBuffer = await input.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.putI32(uint8Array.length);
        uint8Array.forEach((byte) => this.buffer.push(byte), this);
    }

    getBlob() {
        const length = this.getI32();
        const uint8Array = new Uint8Array(
            this.buffer.slice(this.offset, this.offset + length),
        );
        this.offset += length;
        return new Blob([uint8Array]);
    }
}
