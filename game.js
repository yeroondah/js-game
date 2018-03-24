'use strict';

class Vector{
	constructor(x = 0,y = 0){
		this.x = x;
		this.y = y;
	}
	
	plus(vector){
		if(!(vector instanceof Vector)){
			throw  new Error('Можно прибавлять к вектору только вектор типа Vector');
		}
		return new Vector(this.x + vector.x, this.y + vector.y);
	}
	
	times(factor){
		return new Vector(this.x * factor, this.y * factor);
	}
}

class Actor{
	constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)){
		if (!(pos instanceof Vector)){
			throw new Error('Должно быть определено свойство pos, в котором размещен Vector');
		}
		
		if (!(size instanceof Vector)){
			throw new Error('Должно быть определено свойство size, в котором размещен Vector');
		}
		
		if (!(speed instanceof Vector)){
			throw new Error('Должно быть определено свойство speed, в котором размещен Vector');
		}
		
		this.pos = pos;
		this.size = size;
		this.speed = speed;	
	}
	
	get type(){
		return 'actor';
	}
	
	act(){}
	
	get left(){
		return this.pos.x;
	}
	
	get right(){
		return this.pos.x + this.size.x;
	}
	
	get top(){
		return this.pos.y;
	}
	
	get bottom(){
		return this.pos.y + this.size.y;
	}
	
	isIntersect(actor){
		if(!(actor instanceof Actor)){
			throw new Error(`Переменная actor должна быть типа Actor: ${actor}`);
		}
		
		if(this === actor){
			return false;
		}
		
		if(actor.size.x < 0 || actor.size.y < 0){
			return false;
		}
		
		if((this.pos.x === actor.pos.x + actor.size.x)||(actor.pos.x === this.pos.x + actor.size.x)||
		(this.pos.y === actor.pos.y + actor.size.y)||(actor.pos.y === this.pos.y + actor.size.y)){
			return false;
		}
		 
		 return (this.pos.x <= actor.pos.x + actor.size.x && this.pos.x >= actor.pos.x && 
		 this.pos.y <= actor.pos.y + actor.size.y && this.pos.y >= actor.pos.y) ||
		 (this.pos.x <= actor.pos.x + actor.size.x && this.pos.x >= actor.pos.x && 
		 this.pos.y + this.size.y <= actor.pos.y + actor.size.y && this.pos.y + this.size.y >= actor.pos.y) ||
		 (this.pos.x + this.size.x <= actor.pos.x + actor.size.x && this.pos.x + this.size.x >= actor.pos.x && 
		 this.pos.y <= actor.pos.y + actor.size.y && this.pos.y >= actor.pos.y) ||
		 (this.pos.x + this.size.x <= actor.pos.x + actor.size.x && this.pos.x + this.size.x >= actor.pos.x && 
		 this.pos.y + this.size.y <= actor.pos.y + actor.size.y && this.pos.y + this.size.y >= actor.pos.y) ||
		 (actor.pos.x <= this.pos.x + this.size.x && actor.pos.x >= this.pos.x && 
		 actor.pos.y <= this.pos.y + this.size.y && actor.pos.y >= this.pos.y) ||
		 (actor.pos.x <= this.pos.x + this.size.x && actor.pos.x >= this.pos.x && 
		 actor.pos.y + actor.size.y <= this.pos.y + this.size.y && actor.pos.y + actor.size.y >= this.pos.y) ||
		 (actor.pos.x + actor.size.x <= this.pos.x + this.size.x && actor.pos.x + actor.size.x >= this.pos.x && 
		 actor.pos.y <= this.pos.y + this.size.y && actor.pos.y >= this.pos.y) ||
		 (actor.pos.x + actor.size.x <= this.pos.x + this.size.x && actor.pos.x + actor.size.x >= this.pos.x && 
		 actor.pos.y + actor.size.y <= this.pos.y + this.size.y && actor.pos.y + actor.size.y >= this.pos.y);
	}
}

class Level{

	constructor(grid=[], actors=[]) {
		this.grid = grid;
		this.actors = actors;
		this.player = this.actors.find(actor => actor.type === 'player');
		this.status = null;
		this.finishDelay = 1;
	}

	
	get height() {
		return this.grid.length;
	}

	
	get width() {
		return this.grid.reduce(function(prev, arr) {
			return arr.length > prev ? arr.length : prev;
		}, 0);
	}

	isFinished(){
		return(this.status != null && this.finishDelay < 0);
	}
	
	actorAt(actor){
		if(!(actor instanceof Actor)){
			throw new Error('Движущийся объект должен иметь тип Actor');
		}
		
		if(this.grid === undefined ){
			return undefined;
		}
		
		for(const act of this.actors){
			if (typeof act !='undefined' && actor.isIntersect(act)){
				return act;
			}
		}
		return undefined;	
	}
	
	obstacleAt(pos, size){
		if(!(pos instanceof Vector)){
			throw 'pos должен иметь тип Vector';
		}
		
		if(!(size instanceof Vector)){
			throw 'size должен иметь тип Vector';
		}
		
		const xStart = Math.floor(pos.x);
		const xEnd = Math.ceil(pos.x + size.x);
		const yStart = Math.floor(pos.y);
		const yEnd = Math.ceil(pos.y + size.y);

		if (xStart < 0 || xEnd > this.width || yStart < 0) {
			return 'wall';
		}

		if (yEnd > this.height) {
			return 'lava';
		}

		for (let y = yStart; y < yEnd; y++) {
			for (let x = xStart; x < xEnd; x++) {
				const obstacle = this.grid[y][x];
				if (typeof obstacle !== 'undefined') {
					return obstacle;
				}
			}
		}
		return undefined;
	}
	
	removeActor(actor){
		const indexActor = this.actors.indexOf(actor);
		if(indexActor != -1){
			this.actors.splice(indexActor, 1);
		}
	}
	
	noMoreActors(type){
		return this.actors.findIndex((elem) => elem.type === type) === -1;
	}
	
	playerTouched(type, actor){
		if(this.status != null){
			return;
		}
		
		if(type === 'lava' || type === 'fireball'){
			this.status = 'lost';
		}
		
		if(type === 'coin' && actor.type === 'coin'){
			this.removeActor(actor);
			if(this.noMoreActors('coin')){
				this.status = 'won';
			}
		}
	}
}


class LevelParser{
	constructor(dictionary){
		this.dictionary = dictionary;
	}
	
	actorFromSymbol(symbol){
		if(typeof symbol === 'undefined'){
			return undefined;
		}
		
		if(typeof this.dictionary ===  'undefined'){
			return undefined;
		}
		
		return this.dictionary[symbol];
	}
	
	obstacleFromSymbol(symbol){
		return symbols[symbol];
	}
	
	createGrid(strings) {

		return strings.map(function(string) {
			return [...string].map(elem => symbols[elem])
		});
	}
	
	createActors(strings) {
		return strings.reduce((prev, string, Y) => {
			[...string].forEach((symbol, X) => {
				let actorCtr = this.actorFromSymbol(symbol);
				if (actorCtr && typeof (actorCtr) === "function") {
					let pos = new Vector(X, Y);
					let actor = new actorCtr(pos);
					if (actor instanceof Actor) {
						prev.push(actor);
					}
				}
			});
			return prev;
		}, []);
	}
	
	parse(strings){
	return new Level(this.createGrid(strings), this.createActors(strings));
	}
}

class Fireball extends Actor{
	constructor(pos  = new Vector(0,0),speed = new Vector(0,0)){	
		super(pos, new Vector(1,1), speed);
	}
	
	get type(){
		return 'fireball';
	}

	getNextPosition(time = 1){
		return this.pos.plus(this.speed.times(time));
	}

	handleObstacle(){
		this.speed = this.speed.times(-1);
	}

	act(time, level){
		const nextPos = this.getNextPosition(time);
		if(level.obstacleAt(nextPos, this.size)){
			this.handleObstacle();
		}else{
			this.pos = nextPos;
		}
	}
}

class HorizontalFireball extends Fireball{
	constructor(pos = new Vector(0,0)){
		super(pos,new Vector(2,0));
	}
}

class VerticalFireball extends Fireball{
	constructor(pos = new Vector(0,0)){
		super(pos, new Vector(0,2));
	}
}

class FireRain extends Fireball{
	constructor(pos = new Vector(0,0)){
	super(pos, new Vector(0,3));
		this.initPos = pos;
	}
	
	get type(){
		return 'firerain';
	}

	handleObstacle(){
		this.pos = this.initPos;
	}
}
	
class Coin extends Actor {
  constructor(pos) {
	  if(!pos) {
		  pos = new Vector(0, 0);
	  }
	pos = pos.plus(new Vector(0.2, 0.1));
	let size = new Vector(0.6, 0.6);
	super(pos, size);
	
	this.startPos = pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor{
	constructor(pos = new Vector(1,1)) {
		pos = pos.plus(new Vector(0, -0.5));
		let size = new Vector(0.8, 1.5);
		let speed = new Vector(0, 0);
		super(pos, size, speed);	
	}
	
	get type(){
		return 'player';
	}
}

const schemas = [
	[
		'   v         ',
		'             ',
		'             ',
		'@       xxh  ',
		'             ',
		'    xx      o',
		'xx        xxx',
		'             '
	],
	[
		'            ',
		'      v     ',
		'           o',
		'@          x',
		'            ',
		'x v o   x   ',
		'    x       ',
		'         v  '
	],
	[
		' vvv         ',
		'             ',
		'             ',
		'@   h   oo   ',
		'        xx   ',
		'xx  xx       ',
		'        o    ',
		'   x   xx   x'
	]
];

const symbols = {
	'x': 'wall',
	'!': 'lava'
};

const actorDict = {
  '@': Player,
  'v': VerticalFireball,
  'o': Coin,
  'h': HorizontalFireball,
  'f': FireRain
}

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('ты закончил все уровни'));
