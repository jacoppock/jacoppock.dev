"use client";

import { createContext } from 'react';

interface AgentInput {
    input: string;
    chat_history: [string, string][];
}

interface AgentOutput {
    output: string;
    ui: null;
}

export const agent = async (inputs: AgentInput): Promise<AgentOutput> => {
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        output: "Got it!",
        ui: null
    };
};

export const EndpointsContext = createContext({
    agent: (inputs: AgentInput) => agent(inputs)
});

export const useActions = () => ({
    agent: (inputs: AgentInput) => agent(inputs)
});
