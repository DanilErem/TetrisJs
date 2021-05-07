const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); 

const ground = new Image(); 
ground.src = "img/ground.png";

const sw = 10; // Stack width
const sh = 20; // Stack height
const box = 48; // Cell size
//Blocks array
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

//Stack array
let stack = new Array(sh).fill(0).map(() => new Array(sw).fill(0)); 
for (let x = 0; x < sw; x++) {
	for (let y = 0; y < sh; y++) {
		stack[y][x] = 0;	
	}
}

let delay = 8; // For speed of game
let count = 0; // Block counnter
let blockX = 5; // Block's cordinate X in stack arrray
let blockY = 0; // Block's cordinate X in stack arrray
let curBlock = -1; // Number of currrent block (-1 if none)
let shift = "none"; // Left / right shift
let dir = 0; // Block's rotation direction
let oldDir = 0; // Save old direction

document.addEventListener("keydown", direction);

//Event listener
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

//Block rotation logic
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

//Main function
function drawGame() {

	delay -= 1;
	if (delay > 0)
		return;
	else
		delay = 8;
	
	ctx.drawImage(ground, 0, 0);

	// Choose new block if it need
	if (curBlock == -1) {
		curBlock = blocks[Math.floor(Math.random() * blockcount)];
		blockX = 5;
		blockY = -1;
		dir = 0;
		//Block counter
		count++; 
	}
	
	curBlockRot = JSON.parse(JSON.stringify(curBlock));

	//Rotaition if need
	if (dir != 0) {
		curBlockRot = Rotation(curBlock, dir);
	}

	//Left / right shift
	let oldBlockX = blockX;
	if (shift == "right") {
		blockX += 1;		
	} else if (shift == "left") {
		blockX -= 1;
	}

	if (oldBlockX != blockX || dir != oldDir) {
		//Check collision for shift or rotate
		for (let i = 0; i < curBlockRot.length; i++) {
		 	let x = blockX + curBlockRot[i].x;
		 	let y = blockY + curBlockRot[i].y;

		 	if (x < 0 || x > sw-1 || (y >= 0 && y < sh && stack[y][x] == 1)) {
		 		blockX = oldBlockX;
		 		dir = oldDir;
		 		//Array deep copy
				curBlockRot = JSON.parse(JSON.stringify(curBlock));
		 		break;
		 	} 
		}
	}

	if (oldDir != dir) {
		oldDir = dir;
	}

	//Block always falls down
	blockY += 1;

	//Check collision
	let flag = false;
	for (let i = 0; i < curBlockRot.length; i++) {
		let x = blockX + curBlockRot[i].x;
		let y = blockY + curBlockRot[i].y;
		if (y > sh-1) {
			//Bottom of stack
			flag = true;
			break;
		}
		if (y >= 0 && stack[y][x] == 1) {
			//Collision
			flag = true;
			break;
		}
	}
	
	if (flag) {
		if (blockY == 0) {
			//Game over
			clearInterval(game);
		}
		else {
			//Add falled blocks in stack
			for (let i = 0; i < curBlockRot.length; i++) {
				let x = blockX + curBlockRot[i].x;
				let y = blockY - 1 + curBlockRot[i].y;
				if (y >= 0)
					stack[y][x] = 1;			
			}
			//Need next block
			curBlock = -1;
		}
	}

	//Draw blocks in stack	
	for (let x = 0; x < sw; x++) {
		for (let y = 0; y < sh; y++) {
			if (stack[y][x] == 1) {
				ctx.fillStyle = "green";
				ctx.fillRect(x * box, y * box, box, box); 
			}				
		}
	}

	//Drop full lines		
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

	//Draw current block
	if (curBlock != -1) {
		for (let i = 0; i < curBlockRot.length; i++) {
			let x = blockX + curBlockRot[i].x;
			let y = blockY + curBlockRot[i].y;
			ctx.fillStyle = "red";
			ctx.fillRect(x * box, y * box, box, box); 
		}		
	}

	//Drawn counter
	ctx.fillStyle = "white";
	ctx.font = "50px Arial";
	ctx.fillText(count, box * 1, box * 2);

	//Drop "left" / "rigth" shift
	shift = "none";
}

//FPS
let game = setInterval(drawGame, 50);
