
export class Event {
	name;
	/**
	 * @param {number | undefined}
	 */
	step;
	finished = true;
	/**
	 * @param {Array<Event>}
	 */
	next;
	/**
	 * @param {Array<Event>}
	 */
	after;
	custom;
	/**
	 * @param {Event | undefined}
	 */
	parent;
	/**
	 * @param {number | undefined}
	 */
	_triggered;
	_aiexclude;
	_notrigger;
	_result;
	_set;

	player;
	/**
	 * @param {number | undefined}
	 */
	num;

	/**
	 * @param {boolean | undefined}
	 */
	numFixed;

	source;

	content;

	/**
	 * @param {boolean | undefined}
	 */
	_neutralized;

	card;
	cards;

	_backupevent;
	_cardChoice;
	_targetChoice;
	_skillChoice;
	_modparent;
	_args;
	fakeforce;

	/**
	 * @param {string} name
	 * @param {boolean} [trigger]
	 */
	constructor(name, trigger) {
		this.next = [];
		this.after = [];
		if (name === "root") return;
		this.name = name;
		this.step = 0;
		this.finished = false;
		this.custom = {
			add: {},
			replace: {}
		};
		this._aiexclude = [];
		this._notrigger = [];
		this._result = {};
		this._set = [];
		if (trigger !== false) this._triggered = 0;
	}

	addTrigger(skill, player) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		if (!player) return;
		let evt = this, trigger;
		while (true) {
			evt = evt.getParent("arrangeTrigger");
			if (!evt || evt.name !== "arrangeTrigger" || !evt.map) return;
			if (typeof skill == "string") skill = [skill];
			game.expandSkills(skill);
			const filter = function (content) {
				if (typeof content == "string") return content === triggername;
				return content.contains(triggername);
			};
			trigger = evt._trigger;
			let triggername = evt.triggername,
				map = false;
			if (evt.doing && evt.doing.player === player) map = evt.doing;
			else {
				for (let i = 0; i < evt.map.length; i++) {
					if (evt.map[i].player === player) { map = evt.map[i]; break; }
				}
			}
			if (!map) return;
			const func = (skillx) => {
				let info = lib.skill[skillx],
					bool = false;
				for (const i in info.trigger) {
					if (filter(info.trigger[i])) { bool = true; break; }
				}
				if (!bool) return;
				let priority = 0;
				if (info.priority) {
					priority = info.priority * 100;
				}
				if (info.silent) {
					priority++;
				}
				if (info.equipSkill) priority -= 25;
				if (info.cardSkill) priority -= 50;
				if (info.ruleSkill) priority -= 75;
				let toadd = [skillx, player, priority];
				if (map.list2) {
					for (let i = 0; i < map.list2.length; i++) {
						if (map.list2[i][0] === toadd[0] && map.list2[i][1] === toadd[1]) return;
					}
				};
				for (let i = 0; i < map.list.length; i++) {
					if (map.list[i][0] === toadd[0] && map.list[i][1] === toadd[1]) return;
				}
				map.list.add(toadd);
				map.list.sort(function (a, b) {
					return b[2] - a[2];
				});
			};
			for (let j = 0; j < skill.length; j++) {
				func(skill[j]);
			}
		}
	}

	backup(skill) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		this._backup = {
			filterButton: this.filterButton,
			selectButton: this.selectButton,
			filterTarget: this.filterTarget,
			selectTarget: this.selectTarget,
			filterCard: this.filterCard,
			selectCard: this.selectCard,
			position: this.position,
			forced: this.forced,
			fakeforce: this.fakeforce,
			_aiexclude: this._aiexclude,
			complexSelect: this.complexSelect,
			complexCard: this.complexCard,
			complexTarget: this.complexTarget,
			_cardChoice: this._cardChoice,
			_targetChoice: this._targetChoice,
			_skillChoice: this._skillChoice,
			ai1: this.ai1,
			ai2: this.ai2,
			filterOk: this.filterOk,
		};
		if (skill) {
			let info = get.info(skill);
			this.skill = skill;
			this._aiexclude = [];
			const filterCard = (info) => {
				if (info.ignoreMod) this.ignoreMod = true;
				this.filterCard2 = get.filter(info.filterCard);
				this.filterCard = (card, player, event) => {
					const evt = event || _status.event;
					if (!evt.ignoreMod && player) {
						const mod = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
						if (mod !== 'unchanged') return mod;
					}
					return get.filter(evt.filterCard2).apply(this, arguments);
				};
			};

			const filterInject = (info) => {
				if (info.filterButton !== undefined) this.filterButton = get.filter(info.filterButton);
				if (info.selectButton !== undefined) this.selectButton = info.selectButton;
				if (info.filterTarget !== undefined) this.filterTarget = get.filter(info.filterTarget);
				if (info.selectTarget !== undefined) this.selectTarget = info.selectTarget;
				if (info.filterCard !== undefined) filterCard(info);
				if (info.filterOk === undefined) {
					this.filterOk = () => {
						const evt = _status.event;
						let card = get.card(), player = get.player();
						const filter = evt._backup.filterCard;
						if (filter && !filter(card, player, evt)) return false;
						if (evt._backup.filterOk) return evt._backup.filterOk();
						return true;
					};
				}
				else this.filterOk = info.filterOk;
				if (info.selectCard !== undefined) this.selectCard = info.selectCard;
				if (info.position !== undefined) this.position = info.position;
				if (info.forced !== undefined) this.forced = info.forced;
				if (info.complexSelect !== undefined) this.complexSelect = info.complexSelect;
				if (info.complexCard !== undefined) this.complexCard = info.complexCard;
				if (info.complexTarget !== undefined) this.complexTarget = info.complexTarget;
				if (info.ai1 !== undefined) this.ai1 = info.ai1;
				if (info.ai2 !== undefined) this.ai2 = info.ai2;
			};

			if (typeof info.viewAs != "undefined") {
				filterInject(info);
			}
			else {
				this.filterButton = info.filterButton ? get.filter(info.filterButton) : undefined;
				this.selectButton = info.selectButton;
				this.filterTarget = info.filterTarget ? get.filter(info.filterTarget) : undefined;
				this.selectTarget = info.selectTarget;
				this.filterCard = info.filterCard ? get.filter(info.filterCard) : undefined;
				this.selectCard = info.selectCard;
				this.position = info.position;
				this.forced = info.forced;
				this.complexSelect = info.complexSelect;
				this.complexCard = info.complexCard;
				this.complexTarget = info.complexTarget;
				if (info.ai1 !== undefined) this.ai1 = info.ai1;
				if (info.ai2 !== undefined) this.ai2 = info.ai2;
				this.filterOk = info.filterOk;
			}
			delete this.fakeforce;
		}
		delete this._cardChoice;
		delete this._targetChoice;
		delete this._skillChoice;
	}

	/**
	 *
	 * @param {boolean} [all]
	 * @param {any} [player]
	 * @param {"notrigger"} [notrigger]
	 */
	cancel(all, player, notrigger) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		this.untrigger.call(this, arguments);
		this.finish();
		if (notrigger !== "notrigger") {
			this.trigger(`${this.name}Cancelled`);
			if (this.player && lib.phaseName.contains(this.name)) this.player.getHistory("skipped").add(this.name);
		}
	}

	changeToZero() {
		this.num = 0;
		this.numFixed = true;
	}

	finish() {
		this.finished = true;
	}

	getLogv() {
		for (let i = 1; i <= 3; i++) {
			const event = this.getParent(i);
			if (event && event.logvid) return event.logvid;
		}
		return null;
	}

	getParent(level, forced) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		let parent, histories = [];
		if (this._modparent && game.online) {
			parent = this._modparent;
		}
		else {
			parent = this.parent;
		}
		let toreturn = {};
		if (typeof level == "string" && forced === true) {
			toreturn = null;
		}
		if (!parent) return toreturn;
		if (typeof level == "number") {
			for (let i = 1; i < level; i++) {
				if (!parent) return toreturn;
				parent = parent.parent;
			}
		}
		else if (typeof level == "string") {
			for (let i = 0; i < 20; i++) {
				if (!parent) return toreturn;
				histories.push(parent);
				if (parent.name === level) return parent;
				parent = parent.parent;
				if (histories.contains(parent)) return toreturn;
			}
			if (!parent) return toreturn;
		}
		if (toreturn === null) {
			return null;
		}
		return parent;
	}

	getRand(name) {
		if (name) {
			if (!this._rand_map) this._rand_map = {};
			if (!this._rand_map[name]) this._rand_map[name] = Math.random();
			return this._rand_map[name];
		}
		if (!this._rand) this._rand = Math.random();
		return this._rand;
	}

	getTrigger() {
		return this.getParent()._trigger;
	}

	/**
	 *
	 * @param {number} step
	 */
	goto(step) {
		this.step = step - 1;
	}

	insert(func, map) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		let next = game.createEvent(`${this.name}Inserted`, false, this);
		next.setContent(func);
		for (const i in map) {
			next.set(i, map[i]);
		}
		return next;
	}

	insertAfter(func, map) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		let next = game.createEvent(`${this.name}Inserted`, false, { next: [] });
		this.after.push(next);
		next.setContent(func);
		for (const i in map) {
			next.set(i, map[i]);
		}
		return next;
	}

	isMine() {
		const {game, _status} = _anoname_getEnv();
		return (this.player && this.player === game.me && !_status.auto && !this.player.isMad() && !game.notMe);
	}

	isNotLink() {
		return this.getParent().name !== "_lianhuan" && this.getParent().name !== "_lianhuan2";
	}

	isOnline() {
		return (this.player && this.player.isOnline());
	}

	isPhaseUsing(player) {
		const evt = this.getParent("phaseUse");
		if (!evt || evt.name !== "phaseUse") return false;
		return !player || player === evt.player;
	}

	neutralize(event) {
		this.untrigger.call(this, arguments);
		this.finish();
		this._neutralized = true;
		this.trigger("eventNeutralized");
		this._neutralize_event = event || _status.event;
	}

	notLink = this.isNotLink;

	redo() {
		--this.step;
	}

	restore() {
		if (this._backup) {
			this.filterButton = this._backup.filterButton;
			this.selectButton = this._backup.selectButton;
			this.filterTarget = this._backup.filterTarget;
			this.selectTarget = this._backup.selectTarget;
			this.filterCard = this._backup.filterCard;
			this.selectCard = this._backup.selectCard;
			this.position = this._backup.position;
			this.forced = this._backup.forced;
			this.fakeforce = this._backup.fakeforce;
			this._aiexclude = this._backup._aiexclude;
			this.complexSelect = this._backup.complexSelect;
			this.complexCard = this._backup.complexCard;
			this.complexTarget = this._backup.complexTarget;
			this.ai1 = this._backup.ai1;
			this.ai2 = this._backup.ai2;
			this._cardChoice = this._backup._cardChoice;
			this._targetChoice = this._backup._targetChoice;
			this._skillChoice = this._backup._skillChoice;
			this.filterOk = this._backup.filterOk;
		}
		delete this.skill;
		delete this.ignoreMod;
		delete this.filterCard2;
	}

	resume() {
		delete this._cardChoice;
		delete this._targetChoice;
		delete this._skillChoice;
	}

	send() {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		this.player.send((name, args, set, event, skills) => {
			game.me.applySkills(skills);
			/**
			 * @param {Event}
			 */
			const next = game.me[name].apply(game.me, args);
			for (let i = 0; i < set.length; i++) {
				next.set(set[i][0], set[i][1]);
			}
			if (next._backupevent) {
				next.backup(next._backupevent);
			}
			next._modparent = event;
			game.resume();
		}, this.name, this._args || [], this._set,
			get.stringifiedResult(this.parent), get.skillState(this.player));
		this.player.wait();
		game.pause();
	}

	set(key, value) {
		if (arguments.length === 1 && Array.isArray(arguments[0])) {
			for (let i = 0; i < arguments[0].length; i++) {
				if (Array.isArray(arguments[0][i])) {
					this.set(arguments[0][i][0], arguments[0][i][1]);
				}
			}
		}
		else {
			if (typeof key != "string") {
				console.log("warning: using non-string object as event key");
				console.log(key, value);
				console.log(_status.event);
			}
			this[key] = value;
			this._set.push([key, value]);
		}
		return this;
	}

	setContent(name) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		if (typeof name == "function") {
			this.content = lib.init.parsex(name);
		}
		else {
			if (!lib.element.content[name]._parsed) {
				lib.element.content[name] = lib.init.parsex(lib.element.content[name]);
				lib.element.content[name]._parsed = true;
			}
			this.content = lib.element.content[name];
		}
		return this;
	}

	setHiddenSkill(skill) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		if (!this.player) return this;
		let hidden = this.player.hiddenSkills.slice(0);
		game.expandSkills(hidden);
		if (hidden.contains(skill)) this.set("hsskill", skill);
		return this;
	}

	trigger(name) {
		const {lib, game, ai, ui, get, _status} = _anoname_getEnv();
		if (_status.video) return;
		if ((this.name === "gain" || this.name === "lose") && !_status.gameDrawed) return;
		if (name === "gameDrawEnd") _status.gameDrawed = true;
		if (name === "gameStart") {
			if (_status.brawl && _status.brawl.gameStart) {
				_status.brawl.gameStart();
			}
			if (lib.config.show_cardpile) {
				ui.cardPileButton.style.display = '';
			}
			_status.gameStarted = true;
			game.showHistory();
		}
		if (!lib.hookmap[name] && !lib.config.compatiblemode) return;
		if (!game.players || !game.players.length) return;
		let event = this,
			start,
			starts = [_status.currentPhase, event.source, event.player, game.me, game.players[0]];
		for (let i = 0; i < starts.length; i++) {
			if (get.itemtype(starts[i]) === 'player') {
				start = starts[i];
				break;
			}
		}
		if (!start) return;
		if (!game.players.contains(start)) {
			start = game.findNext(start);
		}
		let list = [],
			list2 = [],
			mapx = [],
			allbool = false,
			roles = ["player", "source", "target"],
			listAdded,
			mapxx;

		const addList = (skill, player) => {
			if (listAdded[skill]) return;
			if (player.forbiddenSkills[skill]) return;
			if (player.disabledSkills[skill]) return;
			listAdded[skill] = true;
			const info = lib.skill[skill];
			let num = 0;
			if (info.priority) {
				num = info.priority * 100;
			}
			if (info.silent) {
				num++;
			}
			if (info.equipSkill) num -= 30;
			if (info.ruleSkill) num -= 30;
			if (info.firstDo) {
				list.push([skill, player, num]);
				list.sort((a, b) => b[2] - a[2]);
				allbool = true;
				return;
			}
			else if (info.lastDo) {
				list2.push([skill, player, num]);
				list2.sort((a, b) => b[2] - a[2]);
				allbool = true;
				return;
			}
			mapxx.list.push([skill, player, num]);
			mapxx.list.sort((a, b) => b[2] - a[2]);
			allbool = true;
		};
		let totalPopulation = game.players.length + game.dead.length + 1,
			player = start,
			globalskill = `global_${name}`,
			map = _status.connectMode ? lib.playerOL : game.playerMap;
		for (let iwhile = 0; iwhile < totalPopulation; iwhile++) {
			const id = player.playerid;
			mapxx = {
				player: player,
				list: [],
				list2: [],
			};
			listAdded = {};
			let notemp = player.skills.slice(0);
			for (const j in player.additionalSkills) {
				if (/hidden:/.test(j)) notemp.addArray(player.additionalSkills[j]);
			}
			for (const j in player.tempSkills) {
				if (notemp.contains(j)) continue;
				let expire = player.tempSkills[j];
				if (expire === name ||
					(Array.isArray(expire) && expire.contains(name)) ||
					(typeof expire === "function" && expire(event, player, name))) {
					delete player.tempSkills[j];
					player.removeSkill(j);
				}
				else if (get.objtype(expire) === "object") {
					for (let i = 0; i < roles.length; i++) {
						if (expire[roles[i]] && player === event[roles[i]] &&
							(expire[roles[i]] === name || (Array.isArray(expire[roles[i]]) && expire[roles[i]].contains(name)))) {
							delete player.tempSkills[j];
							player.removeSkill(j);
						}
					}
				}
			}
			if (lib.config.compatiblemode) {
				let skills = player.getSkills(true).concat(lib.skill.global);
				game.expandSkills(skills);
				for (let i = 0; i < skills.length; i++) {
					const info = get.info(skills[i]);
					if (info && info.trigger) {
						let trigger = info.trigger,
							add = false;
						if (trigger.player) {
							if (typeof trigger.player === "string") {
								if (trigger.player === name) add = true;
							}
							else if (trigger.player.contains(name)) add = true;
						}
						if (trigger.target) {
							if (typeof trigger.target === "string") {
								if (trigger.target === name) add = true;
							}
							else if (trigger.target.contains(name)) add = true;
						}
						if (trigger.source) {
							if (typeof trigger.source === "string") {
								if (trigger.source === name) add = true;
							}
							else if (trigger.source.contains(name)) add = true;
						}
						if (trigger.global) {
							if (typeof trigger.global === "string") {
								if (trigger.global === name) add = true;
							}
							else if (trigger.global.contains(name)) add = true;
						}
						if (add) {
							addList(skills[i], player);
						}
					}
				}
			}
			else {
				for (let i = 0; i < roles.length; i++) {
					let triggername = `${player.playerid}_${roles[i]}_${name}`;
					if (lib.hook[triggername]) {
						for (let j = 0; j < lib.hook[triggername].length; j++) {
							addList(lib.hook[triggername][j], player);
						}
					}
					triggername = `${roles[i]}_${name}`;
					if (lib.hook.globalskill[triggername]) {
						for (let j = 0; j < lib.hook.globalskill[triggername].length; j++) {
							addList(lib.hook.globalskill[triggername][j], player);
						}
					}
				}
				if (lib.hook.globalskill[globalskill]) {
					for (let j = 0; j < lib.hook.globalskill[globalskill].length; j++) {
						addList(lib.hook.globalskill[globalskill][j], player);
					}
				}
				for (let i in lib.hook.globaltrigger[name]) {
					if (map[i] === player) {
						for (let j = 0; j < lib.hook.globaltrigger[name][i].length; j++) {
							addList(lib.hook.globaltrigger[name][i][j], map[i]);
						}
					}
				}
			}
			mapx.push(mapxx);
			player = player.nextSeat;
			if (!player || player === start) {
				break;
			}
		}

		if (allbool) {
			let next = game.createEvent('arrangeTrigger', false, event);
			next.setContent('arrangeTrigger');
			next.list = list;
			next.list2 = list2;
			next.map = mapx;
			next._trigger = event;
			next.triggername = name;
			//next.starter=start;
			event._triggering = next;
		}
	}

	unneutralize() {
		this.untrigger.call(this, arguments);
		delete this._neutralized;
		delete this.finished;
		if (this.type === "card" && this.card && this.name === "sha") this.directHit = true;
	}

	untrigger(all, player) {
		let evt = this._triggering;
		if (all) {
			if (evt && evt.map) {
				for (let i = 0; i < evt.map.length; i++) {
					evt.map[i].list = [];
				}
				evt.list = [];
				if (evt.doing) evt.doing.list = [];
			}

			this._triggered = 5;
		}
		else {
			if (player) {
				this._notrigger.add(player);
				if (!evt || !evt.map) return;
				for (let i = 0; i < evt.map.length; i++) {
					if (evt.map[i].player === player) evt.map[i].list.length = 0;
				}
			}
		}
	}

}

export default Event;
