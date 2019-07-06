export type Vector2 = {
	x: number;
	y: number;
};

export function sign(x: number) { return x ? x < 0 ? -1 : 1 : 0; }

export type DrawLineOptions = {
	hidden?: boolean;
	position?: Vector2;
	localPosition?: Vector2;
	localRotation?: Vector2;
	angle?: number;
	scale?: Vector2;
	z?: number;
	stroke?: number;
	strokeColor?: string;
	end?: Vector2;
	radialGradient?: string;
	linearGradient?: string;
}
export function drawLine(options: DrawLineOptions = {}, ctx: CanvasRenderingContext2D) {
	const {
		hidden = false,
		position = { x: 0, y: 0 },
		localPosition = { x: 0, y: 0 },
		// localRotation = { x: 0, y: 0 },
		angle = 0,
		scale = { x: 1, y: 1 },
		stroke = 1,
		strokeColor = 'rgba(255, 0, 255, 1)',
		end = { x: 1, y: 1 },
	} = options;

	if(!hidden){
		ctx.save();
		ctx.translate(position.x, position.y);
		ctx.scale(scale.x, scale.y);
		ctx.rotate(angle);
		ctx.translate(-localPosition.x, -localPosition.y);
		
		// Drawing
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(end.x, end.y);
		ctx.lineWidth = stroke;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();
		
		ctx.restore();
	}
}