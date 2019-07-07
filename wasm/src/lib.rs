mod utils;

extern crate serde_json;
extern crate num;

#[macro_use]
extern crate serde_derive;

use num::Integer;
use wasm_bindgen::prelude::*;
use std::fmt;
//use std::rt::begin_panic_fmt;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CellState {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CellColor {
    Red = 0xff0000,
    Green = 0x11ff99,
    Black = 0x000000,
    White = 0xffffff,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum Direction {
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Cell {
    color: CellColor,
    state: CellState,
}


#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
    entities: Vec<Entity>,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize)]
pub struct Entity {
    x: u32,
    y: u32,
    size: u32,
    color: u32,
    speed_x: i32,
    speed_y: i32,
}

#[wasm_bindgen]
impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx].state as u8;
            }
        }
        count
    }

    pub fn tick(&mut self) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx].state;
                let live_neighbors = self.live_neighbor_count(row, col);

                let next_cell = match (cell, live_neighbors) {
                    // Rule 1: Any live cell with fewer than two live neighbours
                    // dies, as if caused by underpopulation.
                    (CellState::Alive, x) if x < 2 => CellState::Dead,
                    // Rule 2: Any live cell with two or three live neighbours
                    // lives on to the next generation.
                    (CellState::Alive, 2) | (CellState::Alive, 3) => CellState::Alive,
                    // Rule 3: Any live cell with more than three live
                    // neighbours dies, as if by overpopulation.
                    (CellState::Alive, x) if x > 3 => CellState::Dead,
                    // Rule 4: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (CellState::Dead, 3) => CellState::Alive,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise,
                };

                next[idx].state = next_cell;
            }
        }

        self.cells = next;

        self.entities = self.entities.iter()
            .map(|entity| {
                let x = (entity.x as i32 + entity.speed_x + self.width as i32) % self.width as i32;
                let y = (entity.y as i32 + entity.speed_y + self.height as i32) % self.height as i32;

                Entity {
                    x: x as u32,
                    y: y as u32,
                    color: entity.color,
                    speed_x: entity.speed_x,
                    speed_y: entity.speed_y,
                    size: entity.size,
                }
            })
            .collect();

    }

    pub fn new(width: u32, height: u32, js_entities: &JsValue) -> Universe {

        let entities: Vec<Entity> = js_entities.into_serde().unwrap();

        let cells = (0..width * height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell {
                        state: CellState::Alive,
                        color: CellColor::Green,
                    }
                } else {
                    Cell {
                        state: CellState::Dead,
                        color: CellColor::Red,
                    }
                }
            })
            .collect();

        Universe {
            width,
            height,
            cells,
            entities,
        }
    }

    pub fn new_draw(&self) {
        let sq = 5;

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell_state = self.cells[idx].state;
                let cell_color = self.cells[idx].color;

                fillMe(col*sq, row*sq, sq, sq, if cell_state == CellState::Alive { cell_color as u32 } else { CellColor::White as u32 })
            }
        }

        for (_i, entity) in self.entities.iter().enumerate() {
            fillMe(
                entity.x as u32 * sq,
                entity.y as u32 * sq,
                entity.size,
                entity.size,
                entity.color,
            );
        }

    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell.state == CellState::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}

#[wasm_bindgen]
extern {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);


    fn renderMe(x: u32, y: u32, w: u32, h: u32, color: CellColor);
    fn fillMe(x: u32, y: u32, w: u32, h: u32, color: u32);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    let mut number = 10;

    while number != 0 {
        log(&format!("Hello {}, {} time", name, number));

        number -= 1;

        renderMe(10*number,10*number, 100, 30, if number.is_odd() { CellColor::Green } else { CellColor::Red });
    }

}
