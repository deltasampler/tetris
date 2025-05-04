import {index2, wrap} from "@cl/math/math.ts";
import {vec2_t, vec2, vec2n_copy, vec2n_mul, vec2n_muls, vec2n_adds, vec2m_add, vec2n_add, vec2_set} from "@cl/math/vec2.ts";
import {vec3, vec3_copy, vec3_zero} from "@cl/math/vec3.ts";
import {polyomino_t} from "./polyomino.ts";
import {tetromino_pack} from "./tetromino.ts";
import {vec3_t, vec3n_copy} from "@cl/math/vec3.ts";

// cell
export enum CELL_STATE {
    EMPTY,
    MOVING,
    LOCKED
};

export class cell_t {
    state: CELL_STATE;
    position: vec3_t;
    color: vec3_t;
};

export function cell_new(state: CELL_STATE, position: vec3_t, color: vec3_t): cell_t {
    const cell = new cell_t();
    cell.state = state;
    cell.position = vec2n_copy(position);
    cell.color = vec3n_copy(color);

    return cell;
}

// piece
export class piece_t {
    polyomino: polyomino_t;
    position: vec2_t;
    rotation: number;
};

export function piece_new(polyomino: polyomino_t, position: vec2_t, rotation: number) {
    const piece = new piece_t();
    piece.polyomino = polyomino;
    piece.position = vec2n_copy(position);
    piece.rotation = rotation;

    return piece;
}

// tetris
export class tetris_t {
    grid_size: vec2_t;
    cell_size: vec2_t;
    cells: cell_t[];
    len: number;
    polyominos: polyomino_t[];
    poly_index: number;
    piece: piece_t;
    stored: polyomino_t|null;
    has_swapped: boolean;
    lock_delay: number;
    lock_timer: number;
};

export function tetris_new(grid_size: vec2_t, cell_size: vec2_t): tetris_t {
    const tetris = new tetris_t();
    tetris.grid_size = vec2n_copy(grid_size);
    tetris.cell_size = vec2n_copy(cell_size);
    tetris.cells = [];
    tetris.len = grid_size[0] * grid_size[1];
    tetris.polyominos = tetromino_pack();
    tetris.poly_index = 0;
    tetris.piece = piece_new(tetris.polyominos[0], vec2(), 0);
    tetris.stored = null;
    tetris.has_swapped = false;
    tetris.lock_delay = tetris.lock_timer = 1.0;

    const padding = 0.05;
    const padded_cell_size = vec2n_adds(cell_size, padding);
    const total_size = vec2n_mul(grid_size, padded_cell_size);
    const total_hs = vec2n_muls(total_size, 0.5);
    const cell_hs = vec2n_muls(padded_cell_size, 0.5);

    for (let i = 0; i < tetris.len; i += 1) {
        const x = i % grid_size[0];
        const y = -Math.floor(i / grid_size[0]);
        const position = vec2(
            x * padded_cell_size[0] - total_hs[0] + cell_hs[0],
            y * padded_cell_size[1] + total_hs[1] - cell_hs[1]
        )

        tetris.cells.push(cell_new(CELL_STATE.EMPTY, position, vec3()));
    }

    return tetris;
}

export function tetris_check_move(tetris: tetris_t, delta: vec2_t, delta_rot: number): boolean {
    const piece = tetris.piece;
    const polyomino = piece.polyomino;
    const position = vec2n_add(piece.position, delta);
    const rotation = (piece.rotation + delta_rot) % 4;

    for (let x = 0; x < polyomino.size[0]; x += 1) {
        for (let y = 0; y < polyomino.size[1]; y += 1) {
            let rx = 0, ry = 0;

            switch (rotation % 4) {
                case 0:
                    rx = x; ry = y;

                    break;
                case 1:
                    rx = polyomino.size[1] - 1 - y; ry = x;

                    break;
                case 2:
                    rx = polyomino.size[0] - 1 - x; ry = polyomino.size[1] - 1 - y;

                    break;
                case 3:
                    rx = y; ry = polyomino.size[0] - 1 - x;

                    break;
            }

            const i = y * polyomino.size[0] + x;
            const fill = polyomino.cells[i];

            if (!fill) continue;

            const gx = rx + position[0];
            const gy = ry + position[1];

            if (gx < 0 || gx >= tetris.grid_size[0] || gy < 0 || gy >= tetris.grid_size[1]) {
                return false;
            }

            const j = index2(gx, gy, tetris.grid_size[0]);

            if (j >= tetris.len) return false;

            const cell = tetris.cells[j];

            if (cell.state === CELL_STATE.LOCKED) {
                return false;
            }
        }
    }

    return true;
}

export function tetris_fill_piece(tetris: tetris_t, state: CELL_STATE): void {
    const piece = tetris.piece;
    const polyomino = piece.polyomino;
    const position = piece.position;
    const rotation = piece.rotation;

    for (let x = 0; x < polyomino.size[0]; x += 1) {
        for (let y = 0; y < polyomino.size[1]; y += 1) {
            let rx = 0, ry = 0;

            switch (rotation % 4) {
                case 0:
                    rx = x; ry = y;

                    break;
                case 1:
                    rx = polyomino.size[1] - 1 - y; ry = x;

                    break;
                case 2:
                    rx = polyomino.size[0] - 1 - x; ry = polyomino.size[1] - 1 - y;

                    break;
                case 3:
                    rx = y; ry = polyomino.size[0] - 1 - x;

                    break;
            }

            const i = y * polyomino.size[0] + x;
            const fill = polyomino.cells[i];

            if (!fill) continue;

            const j = index2(wrap(rx + position[0], tetris.grid_size[0]), wrap(ry + position[1], tetris.grid_size[1]), tetris.grid_size[0]);

            const cell = tetris.cells[j];
            cell.state = state;

            if (state === CELL_STATE.EMPTY) {
                vec3_zero(cell.color);
            } else {
                vec3_copy(cell.color, polyomino.color);
            }
        }
    }
}

export function tetris_spawn(tetris: tetris_t, polyomino: polyomino_t): void {
    const piece = tetris.piece;
    piece.polyomino = polyomino;
    vec2_set(tetris.piece.position, Math.floor(tetris.grid_size[0] / 2 - polyomino.size[0] / 2), 0);

    if (!tetris_check_move(tetris, vec2(), 0)) {
        tetris_reset(tetris);

        return;
    }

    tetris_fill_piece(tetris, CELL_STATE.MOVING);
}

export function tetris_move(tetris: tetris_t, delta: vec2_t): void {
    if (!tetris_check_move(tetris, delta, 0)) {
        return;
    }

    const piece = tetris.piece;

    tetris_fill_piece(tetris, CELL_STATE.EMPTY);

    vec2m_add(piece.position, delta);

    tetris_fill_piece(tetris, CELL_STATE.MOVING);
}

export const ROTATION_OFFSETS: vec2_t[] = [
    vec2(0, 0),
    vec2(-1, 0),
    vec2(1, 0),
    vec2(0, -1),
    vec2(0, 1),
    vec2(-1, -1),
    vec2(-1, 1),
    vec2(1, -1),
    vec2(1, 1),
    vec2(0, -2),
    vec2(0, -3)
];

export function tetris_rotate(tetris: tetris_t, delta: number): void {
    let index = -1;

    for (let i = 0; i < ROTATION_OFFSETS.length; i += 1) {
        const offset = ROTATION_OFFSETS[i];

        if (tetris_check_move(tetris, offset, delta)) {
            index = i;

            break;
        }
    }

    if (index < 0) {
        return;
    }

    const piece = tetris.piece;
    const offset = ROTATION_OFFSETS[index];

    tetris_fill_piece(tetris, CELL_STATE.EMPTY);

    vec2m_add(piece.position, offset);
    piece.rotation = wrap(piece.rotation + delta, 4);

    tetris_fill_piece(tetris, CELL_STATE.MOVING);
}

export function tetris_resolve(tetris: tetris_t): void {
    const w = tetris.grid_size[0], h = tetris.grid_size[1];

    for (let y = 0; y < h; y += 1) {
        let is_full = true;

        for (let x = 0; x < w; x += 1) {
            const i = index2(x, y, w);
            const cell = tetris.cells[i];

            if (cell.state === CELL_STATE.EMPTY) {
                is_full = false;

                break;
            }
        }

        if (is_full) {
            for (let v = y; v > 0; v -= 1) {
                for (let x = 0; x < w; x += 1) {
                    const curr = index2(x, v, w);
                    const up = index2(x, v - 1, w);
                    const cell_curr = tetris.cells[curr];
                    const cell_up = tetris.cells[up];

                    cell_curr.state = cell_up.state;
                    vec3_copy(cell_curr.color, cell_up.color);
                }
            }
        }
    }
}

export function tetris_reset(tetris: tetris_t): void {
    for (const cell of tetris.cells) {
        cell.state = CELL_STATE.EMPTY;
        vec3_zero(cell.color);
    }

    tetris.poly_index = wrap(tetris.poly_index + 1, tetris.polyominos.length);
    tetris_spawn(tetris, tetris.polyominos[tetris.poly_index]);
}

export function tetris_lock(tetris: tetris_t): void {
    while (tetris_check_move(tetris, vec2(0, 1), 0)) {
        tetris_move(tetris, vec2(0, 1));
    }

    tetris_fill_piece(tetris, CELL_STATE.LOCKED);
    tetris_resolve(tetris);

    tetris.poly_index = wrap(tetris.poly_index + 1, tetris.polyominos.length);
    tetris_spawn(tetris, tetris.polyominos[tetris.poly_index]);

    tetris.has_swapped = false;
    tetris.lock_timer = tetris.lock_delay;
}

export function tetris_store(tetris: tetris_t): void {
    if (!tetris.stored) {
        tetris.stored = tetris.piece.polyomino;
        tetris.poly_index = wrap(tetris.poly_index + 1, tetris.polyominos.length);
        tetris_fill_piece(tetris, CELL_STATE.EMPTY);
        tetris_spawn(tetris, tetris.polyominos[tetris.poly_index]);
        tetris.has_swapped = true;
    } else {
        if (!tetris.has_swapped) {
            const temp = tetris.stored;
            tetris.stored = tetris.piece.polyomino;
            tetris.poly_index = wrap(tetris.poly_index + 1, tetris.polyominos.length);

            tetris_fill_piece(tetris, CELL_STATE.EMPTY);
            tetris.piece.polyomino = temp;

            tetris_spawn(tetris, temp);

            tetris.has_swapped = true;
        }
    }
}
