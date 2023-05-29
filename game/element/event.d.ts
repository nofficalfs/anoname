
export class Event {
	name?: string;
	step?: number;
	finished: boolean;
	next: [Event];
	after: [Event];
	_triggered?: number;

	// TODO
	custom?: any;
	_aiexclude?: [any];
	_notrigger?: [any];
	_result?: any;
	_set?: [[string, any]];

	num?: number
	numFixed?: boolean;

	_neutralized?: boolean;

	constructor(name: string, trigger?: boolean);

	cancel(all?: boolean, player?: any, notrigger?: "notrigger");

	changeToZero(): void;

	finish(): void;

	goto(step: number): void;

	neutralize(event: Event): void;

	redo(): void;

	trigger(name: string): void;

	untrigger(all?: boolean, player?: any);

}
