import Event from "./element/event.js";

export class STATUS {
	paused = false;
	paused2 = false;
	paused3 = false;
	over = false;
	clicked = false;
	auto = false;
	event;
	ai;
	lastdragchange;
	skillaudio;
	dieClose;
	dragline;
	dying;
	globalHistory;
	cardtag;
	renku;
	prehidden_skills;

	brawl;

	/**
	 * @param {any}
	 */
	currentPhase;

	constructor() {
		this.event = new Event("root");
		this.ai = {};
		this.lastdragchange = [];
		this.skillaudio = [];
		this.dieClose = [];
		this.dragline = [];
		this.dying = [];
		this.globalHistory = [{
			cardMove: [],
			custom: [],
			useCard: [],
			changeHp: [],
		}];
		this.cardtag = {
			yingbian_zhuzhan: [],
			yingbian_kongchao: [],
			yingbian_fujia: [],
			yingbian_canqu: [],
		};
		this.renku = [];
		this.prehidden_skills = [];
	}
}

export default STATUS;
