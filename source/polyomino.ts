import { wrap } from "@cl/math/math";
import {vec2, vec2_t, vec2n_copy} from "@cl/math/vec2.ts";
import {vec3_t, vec3n_copy} from "@cl/math/vec3.ts";

export class polyomino_t {
    size: vec2_t;
    cells: number[];
    color: vec3_t;
};

export function polyomino_new(size: vec2_t, cells: number[], color: vec3_t) {
    const piece = new polyomino_t();
    piece.size = vec2n_copy(size);
    piece.cells = [...cells];
    piece.color = vec3n_copy(color);

    return piece;
}

export function polyomino_rotate(polyomino: polyomino_t, x: number, y: number, rotation: number): vec2_t {
    const xw = wrap(x, polyomino.size[0]), yw = wrap(y, polyomino.size[1]);

    switch (rotation % 4) {
        default:
        case 0:
            return vec2(xw, yw);
        case 1:
            return vec2(polyomino.size[1] - 1 - yw, xw);
        case 2:
            return vec2(polyomino.size[0] - 1 - xw, polyomino.size[1] - 1 - yw);
        case 3:
            return vec2(yw, polyomino.size[0] - 1 - xw);
    }
}
