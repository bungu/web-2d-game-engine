// Give the canvas room for all of our cells and a 1px border
// around each of them.
const CELL_SIZE = 5; // px
const canvas = document.getElementById("cnv");
canvas.height = 256;//(CELL_SIZE + 1) * 256 + 1;
canvas.width = 256;//(CELL_SIZE + 1) * 256 + 1;

export const ctx = canvas.getContext('2d');

window.renderMe = function (x, y, w, h, color) {
	ctx.beginPath();
	const fillColor = `#${color.toString(16)}`;
	ctx.fillStyle = fillColor;

	ctx.fillRect(x, y, w, h);
	ctx.stroke();
}

window.fillMe = function (x, y, w, h, color) {
	const fillColor = `#${color.toString(16)}`;
	ctx.fillStyle = fillColor;

	ctx.fillRect(x, y, w, h);
}
