// An assistant to agents

import { type Message } from "@/agents/inferutils/common";
import { type InferenceContext } from "@/agents/inferutils/config.types";

class Assistant<Env> {
    protected history: Message[] = [];
    protected env: Env;
    protected inferenceContext: InferenceContext;

    constructor(env: Env, inferenceContext: InferenceContext, systemPrompt?: Message) {
        this.env = env;
        this.inferenceContext = inferenceContext;
        if (systemPrompt) {
            this.history.push(systemPrompt);
        }
    }

    save(messages: Message[]): Message[] {
        this.history.push(...messages);
        return this.history;
    }

    getHistory(): Message[] {
        return this.history;
    }

    clearHistory() {
        this.history = [];
    } 


}

export default Assistant;
