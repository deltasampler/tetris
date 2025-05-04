import {gl_init} from "@engine/gl.ts";
import {cam2_compute_proj, cam2_compute_view, cam2_new} from "@cl/camera/cam2.ts";
import {io_init, io_kb_key_down, kb_event_t} from "@engine/io.ts";
import {obb_rdata_build, obb_rdata_instance, obb_rdata_new, obb_rend_build, obb_rend_init, obb_rend_render} from "@engine/obb_rend.ts";
import {vec4} from "@cl/math/vec4.ts";
import {vec2, vec2n_mul} from "@cl/math/vec2.ts";
import {tetris_move, tetris_new, tetris_rotate, tetris_reset, tetris_lock, tetris_store, CELL_STATE, tetris_check_move} from "./tetris.ts";
import {UT, gui_canvas, gui_collapsing_header, gui_reload_component, gui_render, gui_text, gui_window, gui_window_grid, gui_window_layout, unit} from "@gui/gui.ts";

const root = gui_window(null);
gui_window_grid(
    root,
    [unit(300, UT.PX), unit(1, UT.FR), unit(300, UT.PX)],
    [unit(1, UT.FR), unit(1, UT.FR), unit(1, UT.FR)]
);

const left = gui_window(root);
const right = gui_window(root);
gui_window_layout(
    root,
    [
        left, right, right,
        left, right, right,
        left, right, right
    ]
);

const canvas = gui_canvas(right);

gui_render(root, document.body);

const canvas_el = canvas.canvas_el;
const gl = gl_init(canvas_el);

io_init();

const tetris = tetris_new(vec2(10, 20), vec2(1.0));
tetris_reset(tetris);

const total_size = vec2n_mul(tetris.grid_size, tetris.cell_size);
const max = Math.max(total_size[0], total_size[1]);
const min = Math.min(canvas_el.width, canvas_el.height);
const buffer = 2;

const camera = cam2_new();
camera.scale = min * 2.0 / (max + buffer);

const obb_rdata = obb_rdata_new();
obb_rdata_build(obb_rdata, tetris.len);

obb_rend_init();
obb_rend_build(obb_rdata);

io_kb_key_down(function(event: kb_event_t): void {
    if (event.code === "ArrowLeft") {
        tetris_move(tetris, vec2(-1, 0));
    }

    if (event.code === "ArrowRight") {
        tetris_move(tetris, vec2(1, 0));
    }

    if (event.code === "ArrowDown") {
        tetris_move(tetris, vec2(0, 1));
    }

    if (event.code === "KeyC") {
        tetris_store(tetris);
    }

    if (event.code === "KeyZ") {
        tetris_rotate(tetris, -1);
    }

    if (event.code === "ArrowUp") {
        tetris_rotate(tetris, 1);
    }

    if (event.code === "KeyX") {
        tetris_rotate(tetris, 2);
    }

    if (event.code === "Space") {
        tetris_lock(tetris);
    }

    if (event.code === "KeyR") {
        tetris_reset(tetris);
    }
});

setInterval(() => {
    tetris_move(tetris, vec2(0, 1));

    if (!tetris_check_move(tetris, vec2(0, 1), 0)) {
        tetris.lock_timer -= 0.1;

        if (tetris.lock_timer <= 0.0) {
            tetris_lock(tetris);
        }
    }
}, 100);

function update() {
    cam2_compute_proj(camera, canvas_el.width, canvas_el.height);
    cam2_compute_view(camera);
}

gl.enable(gl.BLEND)
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.CULL_FACE);

function render(): void {
    gl.viewport(0, 0, canvas_el.width, canvas_el.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let i = 0; i < tetris.len; i += 1) {
        const cell = tetris.cells[i];

        obb_rdata_instance(
            obb_rdata,
            i,
            cell.position,
            tetris.cell_size,
            0,
            0,
            cell.state === CELL_STATE.EMPTY ? vec4(10, 10, 10, 255) : vec4(cell.color[0], cell.color[1], cell.color[2], 255),
            cell.state === CELL_STATE.EMPTY ? vec4(50, 50, 50, 255) : vec4(cell.color[0] / 2, cell.color[1] / 2, cell.color[2] / 2, 255),
            cell.state === CELL_STATE.EMPTY ? 0.1 : 0.2
        );
    }

    obb_rend_render(obb_rdata, camera);
}

function loop(): void {
    update();
    render();

    requestAnimationFrame(loop);
}

loop();

const controls_ch = gui_collapsing_header(left, "Controls");

gui_text(controls_ch, `
    Arrow Left - Move Left<br>
    Arrow Right - Move Right<br>
    Z - Rotate Left<br>
    Arrow Up - Rotate Right<br>
    X - Rotate 180<br>
    C - Store Piece / Place Stored Piece<br>
    Space - Place Piece<br>
    R - Reset
`);

// const general_ch = gui_collapsing_header(left, "General");

gui_reload_component(left);
