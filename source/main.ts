import {gl_init} from "@engine/gl.ts";
import {cam2_compute_proj, cam2_compute_view, cam2_new} from "@cl/camera/cam2.ts";
import {io_init, io_kb_key_down, io_key_down, kb_event_t} from "@engine/io.ts";
import {obb_rdata_build, obb_rdata_instance, obb_rdata_new, obb_rend_build, obb_rend_init, obb_rend_render} from "@engine/obb_rend.ts";
import {vec4} from "@cl/math/vec4.ts";
import {vec2, vec2n_adds, vec2n_mul} from "@cl/math/vec2.ts";
import {tetris_move, tetris_new, tetris_rotate, tetris_reset, tetris_lock, tetris_store, CELL_STATE, tetris_check_move, tetris_reload} from "./tetris.ts";
import {UT, gs_object, gui_button, gui_canvas, gui_collapsing_header, gui_reload_component, gui_render, gui_select, gui_slider_number, gui_text, gui_window, gui_window_grid, gui_window_layout, unit} from "@gui/gui.ts";
import {pentomino_pack} from "./pentomino.ts";
import { tetromino_pack } from "./tetromino.ts";

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

const overlay_el = document.createElement("div");
overlay_el.style.position = "absolute";
overlay_el.style.left = "0";
overlay_el.style.top = "0";
overlay_el.style.width = "100%";
overlay_el.style.height = "100%";
overlay_el.style.fontSize = "32px";
overlay_el.style.color = "#ffffff";
overlay_el.style.padding = "16px";
overlay_el.style.textAlign = "center";
overlay_el.style.fontFamily = "monospace";
right.ref_el.append(overlay_el);

right.ref_el.style.position = "relative";
right.ref_el.style.overflow = "hidden";

const canvas_el = canvas.canvas_el;
const gl = gl_init(canvas_el);

io_init();

const config = {
    width: 10,
    height: 20,
    pack: 0
}

const packs = [
    tetromino_pack(),
    pentomino_pack()
]

const tetris = tetris_new(vec2(config.width, config.height), vec2(1.0));
tetris.polyominos = packs[config.pack];
tetris_reset(tetris);

const camera = cam2_new();

function set_camera_scale() {
    const total_size = vec2n_mul(tetris.grid_size, vec2n_adds(tetris.cell_size, 0.05));
    const max = Math.max(total_size[0], total_size[1]);
    const min = Math.min(canvas_el.width, canvas_el.height);

    camera.scale = min * 2.0 / max;
}

set_camera_scale();

const obb_rdata = obb_rdata_new();
obb_rdata_build(obb_rdata, tetris.len);

obb_rend_init();
obb_rend_build(obb_rdata);

function reload() {
    tetris.grid_size[0] = config.width;
    tetris.grid_size[1] = config.height;
    tetris_reload(tetris);
    obb_rdata_build(obb_rdata, tetris.len);
    obb_rend_build(obb_rdata);
    set_camera_scale();
    tetris.polyominos = packs[config.pack];
    tetris_reset(tetris);
}

const obb_rdata2 = obb_rdata_new();
obb_rdata_build(obb_rdata2, 5);
obb_rend_build(obb_rdata2);

io_kb_key_down(function(event: kb_event_t): void {
    if (event.code === "KeyR") {
        tetris_reset(tetris);
    }

    if (tetris.is_paused) {
        return;
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
});

let last_time = performance.now();
let move_timer = 0;
let drop_timer = 0;
const move_interval = 0.1;
const drop_interval = 0.1;

function update() {
    const now = performance.now();
    const dt = (now - last_time) / 1000.0; // delta time in seconds
    last_time = now;

    cam2_compute_proj(camera, canvas_el.width, canvas_el.height);
    cam2_compute_view(camera);

    if (!tetris.is_paused) {
        move_timer += dt;
        drop_timer += dt;

        if (move_timer >= move_interval) {
            if (io_key_down("ArrowLeft")) {
                tetris_move(tetris, vec2(-1, 0));
            } else if (io_key_down("ArrowRight")) {
                tetris_move(tetris, vec2(1, 0));
            } else if (io_key_down("ArrowDown")) {
                tetris_move(tetris, vec2(0, 1));
            }

            move_timer = 0;
        }

        if (drop_timer >= drop_interval) {
            tetris_move(tetris, vec2(0, 1));

            if (!tetris_check_move(tetris, vec2(0, 1), 0)) {
                tetris.lock_timer -= drop_timer;

                if (tetris.lock_timer <= 0.0) {
                    tetris_lock(tetris);
                }
            }

            drop_timer = 0;
        }
    }
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

    if (!tetris.is_paused) {
        overlay_el.innerHTML = `Score: ${ tetris.score }`;
    } else {
        overlay_el.innerHTML = `Score: ${ tetris.score }<br>Game Over<br>Press R to Restart`;
    }
}

function loop(): void {
    update();
    render();

    requestAnimationFrame(loop);
}

loop();

const controls_ch = gui_collapsing_header(left, "Controls");

gui_text(controls_ch, `
    Arrow Down - Move Down<br>
    Arrow Right - Move Right<br>
    Z - Rotate Left<br>
    Arrow Up - Rotate Right<br>
    X - Rotate 180<br>
    C - Store Piece / Place Stored Piece<br>
    Space - Place Piece<br>
    R - Reset
`);

const general_ch = gui_collapsing_header(left, "General");

gui_slider_number(general_ch, "Width", gs_object(config, "width"), 1, 1, 100);
gui_slider_number(general_ch, "Width", gs_object(config, "height"), 1, 1, 100);
gui_select(general_ch, "Pack", gs_object(config, "pack"), ["Tetromino", "Pentomino"], [0, 1]);

gui_button(general_ch, "Reload", function() {
    reload();
});

gui_reload_component(left);
