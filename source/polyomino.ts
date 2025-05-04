import {vec2_t, vec2n_copy} from "@cl/math/vec2.ts";
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
