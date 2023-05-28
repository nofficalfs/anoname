export const content = function () {
	return {
		paused: false,
		paused2: false,
		paused3: false,
		over: false,
		clicked: false,
		auto: false,
		event: {
			finished: true,
			next: [],
			after: []
		},
		ai: {},
		lastdragchange: [],
		skillaudio: [],
		dieClose: [],
		dragline: [],
		dying: [],
		globalHistory: [{
			cardMove: [],
			custom: [],
			useCard: [],
			changeHp: [],
		}],
		cardtag: {
			yingbian_zhuzhan: [],
			yingbian_kongchao: [],
			yingbian_fujia: [],
			yingbian_canqu: [],
		},
		renku: [],
		prehidden_skills: [],
	};
}

/*
export let paused = false;
export let paused2 = false;
export let paused3 = false;
export let over = false;
export let clicked = false;
export let auto = false;
export let event = {
	finished: true,
	next: [],
	after: []
};
export let ai = {};
export let lastdragchange = [];
export let skillaudio = [];
export let dieClose = [];
export let dragline = [];
export let dying = [];
export let globalHistory = [{
	cardMove: [],
	custom: [],
	useCard: [],
	changeHp: [],
}];
export let cardtag = {
	yingbian_zhuzhan: [],
	yingbian_kongchao: [],
	yingbian_fujia: [],
	yingbian_canqu: [],
};
export let renku = [];
export let prehidden_skills = [];

export default {
	paused,
	paused2,
	paused3,
	over,
	clicked,
	auto,
	event,
	ai,
	lastdragchange,
	skillaudio,
	dieClose,
	dragline,
	dying,
	globalHistory,
	cardtag,
	renku,
	prehidden_skills
};
*/
