
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

	constructor(opts?: "root" | boolean, trigger?: Event);

	changeToZero(): void;

	finish(): void;

	goto(step: number): void;

	redo(): void;

}
