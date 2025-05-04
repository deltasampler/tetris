import {vec2} from "@cl/math/vec2.ts";
import {vec3} from "@cl/math/vec3.ts";
import {polyomino_new, polyomino_t} from "./polyomino.ts";

export enum TETROMINO_TYPE {
    I,
    J,
    L,
    O,
    S,
    T,
    Z
};

export function tetromino(type: TETROMINO_TYPE): polyomino_t {
    switch (type) {
        case TETROMINO_TYPE.I:
            return polyomino_new(
                vec2(4, 1),
                [
                    1, 1, 1, 1
                ],
                vec3(0, 255, 255)
            );
        case TETROMINO_TYPE.J:
            return polyomino_new(
                vec2(2, 3),
                [
                    0, 1,
                    0, 1,
                    1, 1
                ],
                vec3(0, 0, 255)
            );
        case TETROMINO_TYPE.L:
            return polyomino_new(
                vec2(2, 3),
                [
                    1, 0,
                    1, 0,
                    1, 1
                ],
                vec3(255, 165, 0)
            );
        case TETROMINO_TYPE.O:
            return polyomino_new(
                vec2(2, 2),
                [
                    1, 1,
                    1, 1
                ],
                vec3(255, 255, 0)
            );
        case TETROMINO_TYPE.S:
            return polyomino_new(
                vec2(3, 2),
                [
                    0, 1, 1,
                    1, 1, 0
                ],
                vec3(0, 255, 0)
            );
        case TETROMINO_TYPE.T:
            return polyomino_new(
                vec2(3, 2),
                [
                    1, 1, 1,
                    0, 1, 0
                ],
                vec3(128, 0, 128)
            );
        case TETROMINO_TYPE.Z:
            return polyomino_new(
                vec2(3, 2),
                [
                    1, 1, 0,
                    0, 1, 1
                ],
                vec3(255, 0, 0)
            );
    }
}

export function tetromino_pack(): polyomino_t[] {
    return [
        tetromino(TETROMINO_TYPE.I),
        tetromino(TETROMINO_TYPE.J),
        tetromino(TETROMINO_TYPE.L),
        tetromino(TETROMINO_TYPE.O),
        tetromino(TETROMINO_TYPE.S),
        tetromino(TETROMINO_TYPE.T),
        tetromino(TETROMINO_TYPE.Z)
    ];
}
