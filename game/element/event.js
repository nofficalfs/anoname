import {game, get} from "../../main";

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

	/**
	 * @param {boolean | undefined}
	 */
	_neutralized;

	/**
	 * @param {"root" | boolean} [opts]
	 * @param {Event} [trigger]
	 */
	constructor(opts, trigger) {
		this.next = [];
		this.after = [];
		if (opts === "root") return;
		this.finished = false;
		this.custom = {
			add: {},
			replace: {}
		}
		this._aiexclude = [];
		this._notrigger = [];
		this._result = {};
		this._set = [];
		if (opts !== false) this._triggered = 0;
		(trigger ?? globalThis._status.event).next.push(this);
	}

	changeToZero() {
		this.num = 0;
		this.numFixed = true;
	}

	finish() {
		this.finished = true;
	}

	/**
	 *
	 * @param {number} step
	 */
	goto(step) {
		this.step = step - 1;
	}

	neutralize(event) {
		this.untrigger.call(this, arguments);
		this.finish();
		this._neutralized = true;
		this.trigger('eventNeutralized');
		this._neutralize_event = event || _status.event;
	}

	redo() {
		--this.step;
	}

	trigger(name) {
		if (globalThis._status.video) return;
		if ((this.name === "gain" || this.name === "lose") && !globalThis._status.gameDrawed) return;
		if (name === 'gameDrawEnd') globalThis._status.gameDrawed = true;
		if (name === 'gameStart') {
			if (globalThis._status.brawl && globalThis._status.brawl.gameStart) {
				globalThis._status.brawl.gameStart();
			}
			if (globalThis.lib.config.show_cardpile) {
				globalThis.ui.cardPileButton.style.display = '';
			}
			globalThis._status.gameStarted = true;
			globalThis.game.showHistory();
		}
		if (!globalThis.lib.hookmap[name] && !globalThis.lib.config.compatiblemode) return;
		if (!globalThis.game.players || !globalThis.game.players.length) return;
		let event = this,
			start,
			starts = [globalThis._status.currentPhase, event.source, event.player, globalThis.game.me, globalThis.game.players[0]];
		for (let i = 0; i < starts.length; i++) {
			if (get.itemtype(starts[i]) === 'player') {
				start = starts[i];
				break;
			}
		}
		if (!start) return;
		if (!globalThis.game.players.contains(start)) {
			start = globalThis.game.findNext(start);
		}
		let list = [],
			list2 = [],
			mapx = [],
			allbool = false,
			roles = ['player', 'source', 'target'],
			listAdded,
			mapxx;

		const addList = (skill, player) => {
			if (listAdded[skill]) return;
			if (player.forbiddenSkills[skill]) return;
			if (player.disabledSkills[skill]) return;
			listAdded[skill] = true;
			const info = globalThis.lib.skill[skill];
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
		let totalPopulation = globalThis.game.players.length + globalThis.game.dead.length + 1,
			player = start,
			globalskill = `global_${name}`,
			map = globalThis._status.connectMode ? globalThis.lib.playerOL : globalThis.game.playerMap;
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
			if (globalThis.lib.config.compatiblemode) {
				let skills = player.getSkills(true).concat(lib.skill.global);
				globalThis.game.expandSkills(skills);
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
					if (globalThis.lib.hook[triggername]) {
						for (let j = 0; j < globalThis.lib.hook[triggername].length; j++) {
							addList(globalThis.lib.hook[triggername][j], player);
						}
					}
					triggername = `${roles[i]}_${name}`;
					if (globalThis.lib.hook.globalskill[triggername]) {
						for (var j = 0; j < globalThis.lib.hook.globalskill[triggername].length; j++) {
							addList(globalThis.lib.hook.globalskill[triggername][j], player);
						}
					}
				}
				if (globalThis.lib.hook.globalskill[globalskill]) {
					for (let j = 0; j < globalThis.lib.hook.globalskill[globalskill].length; j++) {
						addList(globalThis.lib.hook.globalskill[globalskill][j], player);
					}
				}
				for (let i in globalThis.lib.hook.globaltrigger[name]) {
					if (map[i] === player) {
						for (let j = 0; j < globalThis.lib.hook.globaltrigger[name][i].length; j++) {
							addList(globalThis.lib.hook.globaltrigger[name][i][j], map[i]);
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
			let next = globalThis.game.createEvent('arrangeTrigger', false, event);
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

	untrigger(all, player) {
		var evt = this._triggering;
		if (all) {
			if (evt && evt.map) {
				for (var i = 0; i < evt.map.length; i++) {
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
				for (var i = 0; i < evt.map.length; i++) {
					if (evt.map[i].player == player) evt.map[i].list.length = 0;
				}
			}
		}
	}

}

export default Event;
