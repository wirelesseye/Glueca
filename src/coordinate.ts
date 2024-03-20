import DataBuffer from "./databuffer";

export class Pos {
    constructor(
        public x: number,
        public y: number,
    ) {}

    async writeToDataBuffer(dataBuffer: DataBuffer) {
        dataBuffer.putF64(this.x);
        dataBuffer.putF64(this.y);
    }

    static readFromDataBuffer(dataBuffer: DataBuffer) {
        const x = dataBuffer.getF64();
        const y = dataBuffer.getF64();
        return new Pos(x, y);
    }

    offset(x: number, y: number) {
        return new Pos(this.x + x, this.y + y);
    }

    clone() {
        return new Pos(this.x, this.y);
    }
}

export class Dim {
    constructor(
        public width: number,
        public height: number,
    ) {}

    async writeToDataBuffer(dataBuffer: DataBuffer) {
        dataBuffer.putF64(this.width);
        dataBuffer.putF64(this.height);
    }

    static readFromDataBuffer(dataBuffer: DataBuffer) {
        const width = dataBuffer.getF64();
        const height = dataBuffer.getF64();
        return new Dim(width, height);
    }
}
