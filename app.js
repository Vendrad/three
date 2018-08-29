
var HORIZONTAL = 5;
var VERTICAL = 5;
var STREAM_LENGTH = 2;
var BLOCK_WIDTH = 100;
var BLOCK_HEIGHT = 100;

function start() {
	var info = document.getElementById('info');
	info.style.width = HORIZONTAL * BLOCK_WIDTH + 'px';
	info.style.height = BLOCK_HEIGHT + 'px';
	
	var stream = document.getElementById('stream');
	stream.style.width = STREAM_LENGTH * BLOCK_WIDTH + 'px';
	stream.style.height = BLOCK_HEIGHT + 'px';
	
	var game = document.getElementById('game');
	game.style.width = HORIZONTAL * BLOCK_WIDTH + 'px';
	game.style.height = VERTICAL * BLOCK_HEIGHT + 'px';
	
}

function defined(i) {
	return typeof i !== 'undefined';
}

function Info() {
	score = 0;
	moves = 0;
	var info = document.getElementById('info');
	setInfo();
	
	this.setScore = function () {
		score = Blocks.sumTokens();
		setInfo();
	}
	
	this.incrementMoves = function () {
		moves++;
		setInfo();
	}
	
	function setInfo () {
		info.innerHTML = 'Score: ' + score + '<br>Moves: ' + moves;
	}
}

function Blocks() {
	blocks = [];
	
	this.addBlock = function (x, y, block) {
		if (!defined(blocks[x])) {
			blocks[x] = [];
		}
		blocks[x][y] = block;
	}
	
	this.getBlock = function (x, y) {
		if (!defined(blocks[x])) {
			return false;
		}
		return blocks[x][y];
	};
	
	this.getTokenValue = function (x, y) {
		if (defined(blocks[x]) 
			&& defined(blocks[x][y])
			&& defined(blocks[x][y].token)) {
			return blocks[x][y].token.value;
		}
	}
	
	this.sumTokens = function () {
		sum = 0;
		for (var i = 0; i < VERTICAL; i++) {
			for (var o = 0; o < HORIZONTAL; o++) {
				if (defined(this.getBlock(o, i).token)) {
					sum += this.getBlock(o, i).token.value;
				}
			}
		}
		return sum;
	}
	
	for (var i = 0; i < VERTICAL; i++) {
		for (var o = 0; o < HORIZONTAL; o++) {
			this.addBlock(o, i, new Block(o, i));
		}
	}
};

function Block(x, y) {
	
	function click() {
		if (!defined(this.token)) {
			this.setToken(Stream.take());
		}
	}
	
	this.setup = function() {
		block = document.createElement('div');
		block.style.width = BLOCK_WIDTH + 'px';
		block.style.height = BLOCK_HEIGHT + 'px';
		block.style.lineHeight = BLOCK_HEIGHT + 'px';
		block.className = 'block ' + this.x + '-' + this.y;
		document.getElementById('game').appendChild(block);
		block.addEventListener('click', click.bind(this));
		return block;
	
	}
	
	this.x = x;
	this.y = y;
	this.block = this.setup();
	this.token;
	
	this.setToken = function(token) {
		this.token = token;
		this.block.innerHTML = token.value;
		this.checkToken();
		Info.setScore();
		Info.incrementMoves();
	}
	
	this.removeToken = function() {
		delete this.token;
		this.block.innerHTML = '';
	}
	
	this.checkToken = function() {
		// 3rd to 9th as combination
		// Check around each found for more
		var found = [];
		check(this.x, this.y, this.token.value);
		
		if (found.length >= 3) {
			token = this.token.upgrade();
			this.setToken(token);
			for (var i = 1; i < found.length; i++) {
				Blocks.getBlock(found[i].x, found[i].y).removeToken()
			}
		}
		
		function check(x, y, value) {
			if (x < 0 || y < 0 || x >= HORIZONTAL || y >= VERTICAL) {
				return;
			}
			if (Blocks.getTokenValue(x, y) !== value) {
				return
			}
			if (alreadyFound(x, y)) {
				return;
			}
			
			found.push({x:x,y:y});
			adjacents(x, y, value);
		}
		
		function adjacents(x, y, value) {
			var up = y - 1;
			var down = y + 1;
			var left = x - 1;
			var right = x + 1;
			
			check(x, up, value);
			check(right, y, value);
			check(x, down, value);
			check(left, y, value);
		}
		
		function alreadyFound(x, y) {
			for (var i = 0; i < found.length; i++) {
				if (found[i].x === x && found[i].y === y) {
					return true;
				}
			}
			return false;
		}
		
	}
	
}

function Stream() {
	var upcoming = [];
	
	function removeNext() {
		upcoming[0].block.remove();
		return upcoming.shift().token;
	}
	
	this.add = function () {
		
		var block = document.createElement('div');
		block.style.width = BLOCK_WIDTH + 'px';
		block.style.height = BLOCK_HEIGHT + 'px';
		block.style.lineHeight = BLOCK_HEIGHT + 'px';
		block.className = 'block';
		document.getElementById('stream').appendChild(block);
		
		var token = new Token();
		upcoming.push({block: block, token: token})
		
		block.innerHTML = token.value;
		
	};
	
	this.take = function () {
		this.add();
		return removeNext();
	};
	
	for (var i = 0; i < STREAM_LENGTH; i++) {
		this.add();
	}
	
}

function Token() {
	this.value = (function() {
		var num = Math.random();
		if (num <= 0.62) { return 1; }
		if (num <= 0.82) { return 3; }
		if (num <= 0.92) { return 9; }
		if (num <= 0.97) { return 27; }
		if (num <= 0.99) { return 81; }
		return 243;
	})();
	
	this.upgrade = function () {
		this.value = this.value * 3;
		return this;
	}
	
}
Blocks = new Blocks();
Stream = new Stream();
Info = new Info();
start();






