import Game, { Scene, GameObject } from './core/Game';
import { Vector2 } from './helpers';
import Time from './core/Time';
import { Drawable } from './components/drawable';

function start(mymod: typeof import('../wasm/pkg/wasm')) {
    console.log("All modules loaded");
    mymod.greet('victor');
}

async function load() {
    start(await import('../wasm/pkg/wasm'));
}

load();


window.addEventListener('load', () => {
	const game = new Game();

	const tileset = document.getElementById('tileset') as HTMLImageElement;

	class Box implements GameObject, Drawable {
		public $drawable = true;
		public position: Vector2 = {
			x: 0,
			y: 0,
		};
		public size: Vector2 = {
			x: 16,
			y: 16,
		};
		private speed: Vector2 = {
			x: 1,
			y: 1,
		};

		public start() {	}

		public update(_time: Time, game: Game) {
			const border: Vector2 = {
				x: game.cnv.width,
				y: game.cnv.height,
			};

			const nextMovement: Vector2 = {
				x: this.position.x + this.speed.x,
				y: this.position.y + this.speed.y,
			};

			if (nextMovement.x < 0 || nextMovement.x + this.size.x >= border.x) {
				this.speed.x *= -1;
				nextMovement.x = this.position.x + this.speed.x;
			}

			if (nextMovement.y < 0 || nextMovement.y + this.size.y >= border.y) {
				this.speed.y *= -1;
				nextMovement.y = this.position.y + this.speed.y;
			}

			this.position.x = nextMovement.x;
			this.position.y = nextMovement.y;
		}

		public draw(ctx: CanvasRenderingContext2D, _time: Time, _game: Game) {
			ctx.drawImage(tileset, 182, 92, this.size.x, this.size.y, this.position.x, this.position.y, this.size.x, this.size.y);
		}

		public destroy() {}
	}
	const box = new Box();

	const sceneMainMenu: Scene = {
		objects: [
			box,
		],
		sources: [],
	};

	game.run({
		scene: sceneMainMenu,
	});
});