import Time from './Time';
import { Vector2 } from 'src/components/vector2';

export const DEFAULT_MOUSE_DATA: MouseData = {
	position: { x: 0, y: 0 },
	button: -1,
	up: false,
	down: false,
};

export interface GameObject {
	start: () => void;
	update: (time: Time, game: Game) => void;
	destroy: () => void;
	z?: number;
}
export type Source = {
	complete?: boolean;
}
export type Scene = {
	objects: GameObject[];
	sources: Source[];
}
export type MouseData = {
	position: Vector2;
	button: number;
	up?: boolean;
	down?: boolean;
}

export type GameOptions = {
	scene: Scene;
}

class Game {
	public cnv: HTMLCanvasElement = (document.getElementById("cnv") as HTMLCanvasElement);
	public ctx: CanvasRenderingContext2D = (document.getElementById("cnv") as HTMLCanvasElement).getContext("2d") as CanvasRenderingContext2D;
	public status: 'init' | 'loading' | 'ready' | 'run' = 'init';
	public scene: Scene = {
		objects: [],
		sources: [],
	};
	public time: Time = new Time();
	public mouse: MouseData = DEFAULT_MOUSE_DATA;

	constructor() {
		this.start = this.start.bind(this);
		this.draw = this.draw.bind(this);
		this.run = this.run.bind(this);
		this.loadScene = this.loadScene.bind(this);
	}

	public start(options: GameOptions) {
		this.status = 'loading';
		this.scene = options.scene;

		// Context options
		(this.ctx as any).webkitImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;

		// Insertion sort
		for (let i = 0; i < this.scene.objects.length; i++) {
			const object = this.scene.objects[i];

			if (typeof object.z === 'undefined') {
				object.z = i;
			}

			let j = i -1;
			for (; j > -1 && (this.scene.objects[j].z || 0) > 1; j--) {
				this.scene.objects[j + 1] = this.scene.objects[j];
			}

			this.scene.objects[j + 1] = object;
		}

		// Loading sources
		let k = 0;
		while (this.status !== 'ready') {
			if (this.scene.sources.length === 0) {
				this.status = 'ready';
			} else {
				if (this.scene.sources[k].complete) {
					k++;
					if (k >= this.scene.sources.length) {
						this.status = 'ready';
					}
				}
			}
		}

		// Mouse input
		this.mouse = DEFAULT_MOUSE_DATA;
		this.cnv.addEventListener('mousemove', (e) => {
			this.mouse.position.x = e.clientX - (e.target as HTMLElement).offsetLeft;
			this.mouse.position.y = e.clientY - (e.target as HTMLElement).offsetTop;
		}, false);
		this.cnv.addEventListener('mousedown', (e) => {
			this.mouse.button = e.button;
			this.mouse.up = false;
			this.mouse.down = true;
		});
		this.cnv.addEventListener('mouseup', (e) => {
			this.mouse.button = e.button;
			this.mouse.up = true;
			this.mouse.down = false;
		});

		this.time.sceneLoaded = Date.now();
		this.time.tick();

		for (let i = 0; i < this.scene.objects.length; i++) {
			this.scene.objects[i].start();
		}
	}

	public draw() {
		requestAnimationFrame(this.draw);

		this.ctx.clearRect(0, 0, this.cnv.width, this.cnv.height);
		this.time.tick();

		for (let i = 0; i <  this.scene.objects.length; i++) {
			const object = this.scene.objects[i];
			object.update(this.time, this);

			if ((object as any).$drawable) {
				(object as any).draw(this.ctx, this.time, this);
			}
		}
		
		this.mouse.up = false;
	}

	public run(options: GameOptions) {
		setInterval(() => {
			this.time.framerate();
		}, 1000);
		this.start(options);

		if(this.status == 'ready'){
			this.status = 'run';
			this.draw();
		}
	}

	public loadScene(scene: Scene) {
		this.status = 'init';
		this.time = new Time();
		this.scene = {
			objects: [],
			sources: [],
		};
		this.start({ scene });
	}
}

export default Game;