import { Vector2 } from "src/components/vector2";
import Game from "src/core/Game";
import Time from "src/core/Time";

export interface Drawable {
	$drawable: boolean;
	position: Vector2;
	size: Vector2;
	draw: (ctx: CanvasRenderingContext2D, time: Time, game: Game) => void;
}