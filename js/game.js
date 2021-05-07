const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ground = new Image();
ground.src = "img/ground.png";

const sw = 10;
const sh = 20;
const box = 48;
const blocks = [
	[{x: 0, y: 0},	{x: -1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
	[{x: 0, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}],
	[{x: 0, y: 0}, {x: -1, y: 0}, {x: 0, y: -1}, {x: 1, y: 0}],
	[{x: 0, y: 0}, {x: -1, y: -1}, {x: -1, y: 0}, {x: 1, y: 0}],
	[{x: 0, y: 0}, {x: 1, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}],
	[{x: 0, y: 0}, {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: 0}],
	[{x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: -1}, {x: 0, y: -1}]
];

let blockcount = blocks.length;

let stack = new Array(sh).fill(0).map(() => new Array(sw).fill(0));
for (let x = 0; x < sw; x++) {
	for (let y = 0; y < sh; y++) {
		stack[y][x] = 0;	
	}
}

let delay = 8;
let count = 0;
let blockX = 5;
let blockY = 0;
let curBlock = -1;
let shift = "none";
let dir = 0;
let oldDir = 0;

document.addEventListener("keydown", direction);

function direction(event) {
	if(event.keyCode == 37)
		shift = "left";
	else if(event.keyCode == 39)
		shift = "right";
	else if(event.keyCode == 38) {
		oldDir = dir;
		dir = (dir + 1) % 4;
	}
	else if(event.keyCode == 40)
		delay = 1;
}

function Rotation(Block, direction) {
	//let alpha = Math.PI * direction / 2.0;
	let BlockRot = JSON.parse(JSON.stringify(Block));
	for (let i = 0; i < Block.length; i++) {
	 	let x = BlockRot[i].x;
	 	let y = BlockRot[i].y;
	 	//BlockRot[i].x = x * Math.cos(alpha) - y * Math.sin(alpha);
	 	//BlockRot[i].y = x * Math.sin(alpha) + y * Math.cos(alpha);
	 	if (dir == 1) {
	 		BlockRot[i].x = x * 0 - y * 1;
	 		BlockRot[i].y = x * 1 + y * 0;
	 	}
	 	else if (dir == 2) {
	 		BlockRot[i].x = x * -1.0 - y * 0;
	 		BlockRot[i].y = x * 0 + y * -1.0;
	 	}
	 	else if (dir == 3) {
	 		BlockRot[i].x = x * 0 - y * -1.0;
	 		BlockRot[i].y = x * -1.0 + y * 0;
	 	}
	}
	return BlockRot;	 	
}

function drawGame() {

	delay -= 1;
	if (delay > 0)
		return;
	else
		delay = 8;
	
	ctx.drawImage(ground, 0, 0);

	if (curBlock == -1) {
		curBlock = blocks[Math.floor(Math.random() * blockcount)];
		blockX = 5;
		blockY = -1;
		dir = 0;
		count++; 
	}
	
	curBlockRot = JSON.parse(JSON.stringify(curBlock));

	if (dir != 0) {
		curBlockRot = Rotation(curBlock, dir);
	}

	let oldBlockX = blockX;
	if (shift == "right") {
		blockX += 1;		
	} else if (shift == "left") {
		blockX -= 1;
	}

	let oldBlockY = blockY;
	blockY += 1;

	for (let i = 0; i < curBlockRot.length; i++) {
	 	let x = blockX + curBlockRot[i].x;
	 	let y = blockY + curBlockRot[i].y;

	 	if (x < 0 || x > sw-1) {
	 		blockX = oldBlockX;
	 		dir = oldDir;
			curBlockRot = JSON.parse(JSON.stringify(curBlock));
	 		break;
	 	} 
	}

	if (oldDir != dir) {
		oldDir = dir;
	}

	let flag = false;
	for (let i = 0; i < curBlockRot.length; i++) {
		let x = blockX + curBlockRot[i].x;
		let y = blockY + curBlockRot[i].y;
		if (y > sh-1) {
			flag = true;
			break;
		}
		if (y >= 0 && stack[y][x] == 1) {
			if (blockY == 0) {
				clearInterval(game);
			}
			flag = true;
			break;
		} 

	}
	
	if (flag) {
		blockY = oldBlockY;
		for (let i = 0; i < curBlockRot.length; i++) {
			let x = blockX + curBlockRot[i].x;
			let y = blockY + curBlockRot[i].y;
			stack[y][x] = 1;			
		}
		curBlock = -1;
	}

		
	for (let x = 0; x < sw; x++) {
		for (let y = 0; y < sh; y++) {
			if (stack[y][x] == 1) {
				ctx.fillStyle = "green";
				ctx.fillRect(x * box, y * box, box, box); 
			}				
		}
	}

		
	for (let y = 0; y < sh; y++) {
		let i = y;
		for (let x = 0; x < sw; x++) {
			if (stack[y][x] == 0) {
				i = -1;
				break;
			}				
		}
		if (i >= 0) {
			stack.splice(i, 1);
			stack.unshift([0,0,0,0,0,0,0,0,0,0]);
		}
	}

	if (curBlock != -1) {
		for (let i = 0; i < curBlockRot.length; i++) {
			let x = blockX + curBlockRot[i].x;
			let y = blockY + curBlockRot[i].y;
			ctx.fillStyle = "red";
			ctx.fillRect(x * box, y * box, box, box); 
		}		
	}

	// ctx.fillStyle = "black";
	// ctx.fillRect(1 * box, 0, 1, box * 20);


	// for (let i = 1; i++; i < 10) {
	// 	ctx.fillStyle = "black";
	// 	ctx.fillRect(i * box, 0, 1, box * 20);
	// }

	ctx.fillStyle = "white";
	ctx.font = "50px Arial";
	ctx.fillText(count, box * 1, box * 2);

	shift = "none";
}

let game = setInterval(drawGame, 50);
