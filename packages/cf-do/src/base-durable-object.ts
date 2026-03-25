export abstract class BaseDurableObject implements DurableObject {
	protected readonly state: DurableObjectState;
	protected readonly env: Record<string, unknown>;

	constructor(state: DurableObjectState, env: Record<string, unknown>) {
		this.state = state;
		this.env = env;
	}

	abstract fetch(request: Request): Promise<Response>;
}
