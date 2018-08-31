var INFO_SIZE = '2em';
var HORIZONTAL = 5;
var VERTICAL = 10;
var ENEMY_VERTICAL = 5;
var STREAM_LENGTH = 1;
var POSITION_WIDTH = 50;
var POSITION_HEIGHT = 50;

var Info = new Info();
var Stream = new Stream();
var Board = new Board();
Board.setupBoard();


function defined(i) {
	return typeof i !== 'undefined';
}

function randb(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Info() {
	var score = 0;
	var moves = 0;
	this.element;
	
	this.construct = function () {
		
		this.element = this.initElement();
		
		this.setInfo();

	}
	
	this.initElement = function () {
		
		var element = document.getElementById('info');
		element.style.width = HORIZONTAL * POSITION_WIDTH + 'px';
		
		return element
	
	}
	
	this.setScore = function () {
		score = Board.sumTokenValues();
		this.setInfo();
	}
	
	this.incrementScore = function (value) {
		score += value;
		this.setInfo();
	}
	
	this.incrementMoves = function () {
		moves++;
		this.setInfo();
	}
	
	this.setInfo = function () {
		this.element.innerHTML = 'Score: ' + score + '<br>Moves: ' + moves;
	}
	
	this.construct();
	
}

function Board() {
	
	var positions = [];
	this.enemies = [];
	this.element;
	
	this.construct = function () {
		
		this.element = this.initElement();

	}
	
	this.initElement = function () {
		
		var element = document.getElementById('game');
		element.style.width = HORIZONTAL * POSITION_WIDTH + 'px';
		element.style.height = VERTICAL * POSITION_HEIGHT + 'px';
		
		return element
	
	}
	
	this.setupBoard = function () {
				
		for (var y = 0; y < VERTICAL; y++) {
			for (var x = 0; x < HORIZONTAL; x++) {
				this.createPosition(x, y);
			}
		}

	}
	
	this.createPosition = function (x, y) {
		if (!defined(positions[x])) {
			positions[x] = [];
		}
		positions[x][y] = new Position(x, y);
		this.element.appendChild(positions[x][y].element);
	}
	
	this.getPosition = function (x, y) {
		if (this.positionDoesntExist(x, y)) {
			return false;
		}
		return positions[x][y];
	}
	
	this.positionExists = function (x, y) {
		if (!defined(positions[x]) || !defined(positions[x][y])) {
			return false;
		}
		return true;
	}
	
	this.positionDoesntExist = function (x, y) {
		return !this.positionExists(x, y);
	}
	
	this.positionHasToken = function (x, y) {
		return defined(this.getPosition(x, y).token);
	}
	
	this.tokenValueAt = function (x, y) {
		if (this.positionHasToken(x, y)) {
			return this.getPosition(x, y).token.value;
		}
		return 0;
	}
	
	this.sumTokenValues = function () {
		sum = 0;
		for (var y = 0; y < VERTICAL; y++) {
			for (var x = 0; x < HORIZONTAL; x++) {
				sum += this.tokenValueAt(x, y);
			}
		}
		return sum;
	}
	
	this.moveToken = function (token, x, y) {
		
		if (defined(token.x)) {
			this.getPosition(token.x, token.y).removeToken();
		}
		
		token.x = x;
		token.y = y;
		this.getPosition(x, y).setToken(token);
		
	}
	
	this.enemyTurn = function () {
		
		this.moveEnemies();
		
		this.createEnemy();
		
	}
	
	this.moveEnemies = function () {
		
		// Hacky response from moveEnemy returns false for enemy not moved. In this version of the game we can
		// assume they haven't moved because they are dead and therefore sliced from this.enemies. To ensure no
		// Enemies are missed in this loop we drop the index 1 under these conditions
		for (var i = 0; i < this.enemies.length; i++) {
			if(!this.moveEnemy(this.enemies[i])) {
				i--;
			}
		}
	}
	
	this.moveEnemy = function (enemy) {
		
		xTarget = enemy.x;
		yTarget = enemy.y - 1;
		
		if (this.positionDoesntExist(xTarget, yTarget)) {
			alert('game over. code a better game over too! (refresh browser to start over)');
		}
		
		var targetPosition = this.getPosition(xTarget, yTarget)
		
		if (targetPosition.hasPlayerToken()) {
			// resolve conflict
			// future versions may include a no kill scenario or target positions actually being another enemy
			targetPosition.token.takeDamage(enemy.value);
			enemy.takeDamage(targetPosition.token.value);
			
			if (targetPosition.token.health <= 0) {
				targetPosition.removeToken();
			}
			
		}
		
		if (enemy.health <= 0) {
			
			this.removeEnemy(enemy);
			return false;
			
		}
			
		this.moveToken(enemy, targetPosition.x, targetPosition.y);
		
		return true;
		
	}
	
	this.createEnemy = function () {
		var token = new Token('enemy');
		x = randb(0, HORIZONTAL - 1);
		y = VERTICAL - 1;
		this.enemies.push(token);
		this.moveToken(token, x, y);
	}
	
	this.removeEnemy = function (token) {
		
		for (var i = 0; i < this.enemies.length; i++) {
			if (this.enemies[i].x === token.x && this.enemies[i].y === token.y) {
				this.enemies.splice(i, 1);
				this.getPosition(token.x, token.y).removeToken();
				Info.incrementScore(token.value);
				return;
			}
		}
		
	}
	
	this.construct()
	
}

function Position(x, y) {
	
	this.x = x;
	this.y = y;
	this.element;
	this.type;
	this.token;
	
	this.construct = function () {
		
		this.type = this.setType();
		this.element = this.initElement();
		
		if (this.type === 'player') {
			this.element.addEventListener('click', click.bind(this));
		}

	}
	
	this.setType = function () {
		if (this.y < VERTICAL - ENEMY_VERTICAL) {
			return 'player';
		}
		return 'enemy';
	}
	
	this.initElement = function () {
		var element = document.createElement('div');
		element.style.width = POSITION_WIDTH + 'px';
		element.style.height = POSITION_HEIGHT + 'px';
		element.style.lineHeight = POSITION_HEIGHT + 'px';
		element.className = this.buildClasses();
		
		return element;
	}
	
	this.buildClasses = function () {
		var classes = ['position', this.type + '-area'];
		return classes.join(' ');
	}
	
	function click() {
		if (!defined(this.token)) {
			Board.moveToken(Stream.take(), this.x, this.y);
			Board.enemyTurn();
			Info.incrementMoves();
		}
	}
	
	this.setToken = function (token) {
		this.token = token;
		this.element.appendChild(token.element);
		this.checkToken();
	}
	
	this.removeToken = function () {
		this.token.element.remove();
		delete this.token;
	}
	
	this.checkToken = function () {
		// Future versions may include enemy upgrading
		if (this.token.type ==='enemy') {
			return;
		}
		
		var found = [];
		check(this.x, this.y, this.token.value);
		
		if (found.length >= 3) {
			token = this.token.upgrade(found.length);
			this.setToken(token);
			for (var i = 1; i < found.length; i++) {
				Board.getPosition(found[i].x, found[i].y).removeToken()
			}
		}
		
		function check(x, y, value) {
			if (x < 0 || y < 0 || x >= HORIZONTAL || y >= VERTICAL) {
				return;
			}
			if (Board.tokenValueAt(x, y) !== value) {
				return;
			}
			if (Board.getPosition(x, y).token.type === 'enemy') {
				return;
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
	
	this.hasPlayerToken = function () {
		if (defined(this.token)) {
			return this.token.type === 'player';
		}
	}
	
	this.construct();
	
}

function Stream() {
	var upcoming = [];
	this.element;
	
	this.construct = function () {
		
		this.element = this.initElement();
		
		for (var i = 0; i < STREAM_LENGTH; i++) {
			this.add();
		}

	}
	
	this.initElement = function () {
		
		var element = document.getElementById('stream');
		element.style.width = STREAM_LENGTH * POSITION_WIDTH + 'px';
		element.style.height = POSITION_HEIGHT + 'px';
	
		return element
	
	}
	
	function removeNext() {
		upcoming[0].element.remove();
		return upcoming.shift().token;
	}
	
	this.add = function () {
		
		var element = document.createElement('div');
		element.style.width = POSITION_WIDTH + 'px';
		element.style.height = POSITION_HEIGHT + 'px';
		element.style.lineHeight = POSITION_HEIGHT + 'px';
		element.className = 'position';
		this.element.appendChild(element);
		
		var token = new Token('player');
		element.appendChild(token.element);
		
		upcoming.push({element: element, token: token})
		
	}
	
	this.take = function () {
		this.add();
		return removeNext();
	}
	
	this.construct();
	
}

function Token(type) {
	
	this.type = type;
	this.value;
	this.health;
	this.x;
	this.y;

	this.construct = function () {
		
		this.value = setValue(this.type);
		this.health = this.value;
		this.element = this.initElement();
		this.setVisual();
		
	}
	
	this.initElement = function () {
		var element = document.createElement('div');
		element.className = this.buildClasses();
		
		
		return element;
	}
	
	this.buildClasses = function () {
		var classes = ['token', this.type, this.type + this.value];
		return classes.join(' ');
	}
	
	this.setVisual = function () {
		this.element.innerHTML = '<span class="value">' + this.value + '</span><span class="health">' + this.health + '</span>';
	}
	
	this.upgrade = function (number_combined) {
		this.health = this.value * number_combined;
		this.value = this.value * 3;
		this.setVisual();
		return this;
	}
	
	this.takeDamage = function (damage) {
		this.health -= damage;
		this.setVisual();
	}
	
	function setValue (type) {
		var num = Math.random();
		
		if (type !== 'player') {
			if (num <= 0.70) { return 1; }
			return 3;
			if (num <= 0.95) { return 3; }
			if (num <= 0.99) { return 9; }
			if (num <= 0.999) { return 9; }
			if (num <= 0.9999) { return 9; }
			return 9;
		}
		
		if (num <= 0.70) { return 1; }
		if (num <= 0.95) { return 3; }
		if (num <= 0.99) { return 9; }
		if (num <= 0.999) { return 27; }
		if (num <= 0.9999) { return 81; }
		return 243;
		
	}
	
	this.construct();
	
}






