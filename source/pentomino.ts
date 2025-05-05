import {vec2} from "@cl/math/vec2.ts";
import {vec3} from "@cl/math/vec3.ts";
import {polyomino_new, polyomino_t} from "./polyomino.ts";

export enum PENTOMINO_TYPE {
    F,
    I,
    L,
    N,
    P,
    T,
    U,
    V,
    W,
    X,
    Y,
    Z
}

export function pentomino(type: PENTOMINO_TYPE): polyomino_t {
    switch (type) {
        case PENTOMINO_TYPE.F:
            return polyomino_new(
                vec2(3, 3),
                [
                    0, 1, 1,
                    1, 1, 0,
                    0, 1, 0
                ],
                vec3(255, 105, 180)
            );
        case PENTOMINO_TYPE.I:
            return polyomino_new(
                vec2(1, 5),
                [
                    1,
                    1,
                    1,
                    1,
                    1
                ],
                vec3(0, 255, 255)
            );
        case PENTOMINO_TYPE.L:
            return polyomino_new(
                vec2(2, 4),
                [
                    1, 0,
                    1, 0,
                    1, 0,
                    1, 1
                ],
                vec3(255, 140, 0)
            );
        case PENTOMINO_TYPE.N:
            return polyomino_new(
                vec2(2, 4),
                [
                    0, 1,
                    0, 1,
                    1, 1,
                    1, 0
                ],
                vec3(0, 128, 128)
            );
        case PENTOMINO_TYPE.P:
            return polyomino_new(
                vec2(2, 3),
                [
                    1, 1,
                    1, 1,
                    1, 0
                ],
                vec3(255, 0, 255)
            );
        case PENTOMINO_TYPE.T:
            return polyomino_new(
                vec2(3, 3),
                [
                    1, 1, 1,
                    0, 1, 0,
                    0, 1, 0
                ],
                vec3(128, 0, 128)
            );
        case PENTOMINO_TYPE.U:
            return polyomino_new(
                vec2(3, 2),
                [
                    1, 0, 1,
                    1, 1, 1
                ],
                vec3(0, 128, 255)
            );
        case PENTOMINO_TYPE.V:
            return polyomino_new(
                vec2(3, 3),
                [
                    1, 0, 0,
                    1, 0, 0,
                    1, 1, 1
                ],
                vec3(0, 255, 0)
            );
        case PENTOMINO_TYPE.W:
            return polyomino_new(
                vec2(3, 3),
                [
                    1, 0, 0,
                    1, 1, 0,
                    0, 1, 1
                ],
                vec3(255, 255, 0)
            );
        case PENTOMINO_TYPE.X:
            return polyomino_new(
                vec2(3, 3),
                [
                    0, 1, 0,
                    1, 1, 1,
                    0, 1, 0
                ],
                vec3(128, 128, 128)
            );
        case PENTOMINO_TYPE.Y:
            return polyomino_new(
                vec2(2, 4),
                [
                    0, 1,
                    1, 1,
                    0, 1,
                    0, 1
                ],
                vec3(255, 0, 0)
            );
        case PENTOMINO_TYPE.Z:
            return polyomino_new(
                vec2(3, 3),
                [
                    1, 1, 0,
                    0, 1, 0,
                    0, 1, 1
                ],
                vec3(0, 0, 255)
            );
    }
}

export function pentomino_pack(): polyomino_t[] {
    return [
        pentomino(PENTOMINO_TYPE.F),
        pentomino(PENTOMINO_TYPE.I),
        pentomino(PENTOMINO_TYPE.L),
        pentomino(PENTOMINO_TYPE.N),
        pentomino(PENTOMINO_TYPE.P),
        pentomino(PENTOMINO_TYPE.T),
        pentomino(PENTOMINO_TYPE.U),
        pentomino(PENTOMINO_TYPE.V),
        pentomino(PENTOMINO_TYPE.W),
        pentomino(PENTOMINO_TYPE.X),
        pentomino(PENTOMINO_TYPE.Y),
        pentomino(PENTOMINO_TYPE.Z)
    ];
}
