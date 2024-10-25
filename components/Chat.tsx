"use client";

import { useActions } from "@/app/agent";
import { AIMessageText, HumanMessageText } from '@/components/MessageText';
import { Send } from "lucide-react";
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface ChatProps {
    response: any;
    setResponse: (response: any) => void;
}

interface Message {
    id: string;
    content: string;
    timestamp: string;
    isAI: boolean;
}

const Chat: React.FC<ChatProps> = ({ response, setResponse }) => {
    const actions = useActions();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            setIsLoading(true);

            // Immediately add the human message
            const newHumanMessage: Message = {
                id: Date.now().toString(),
                content: input,
                timestamp: new Date().toLocaleTimeString(),
                isAI: false
            };
            setMessages(prevMessages => [...prevMessages, newHumanMessage]);

            // Clear input right after sending
            setInput("");

            // Then get AI response
            const result = await actions.agent({
                input: newHumanMessage.content,
                chat_history: messages.map(m => [m.isAI ? "ai" : "human", m.content]),
            });

            console.log('Response UI:', result.ui);
            setResponse(result);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: result.output,
                timestamp: new Date().toLocaleTimeString(),
                isAI: true
            };
            setMessages(prevMessages => [...prevMessages, aiResponse]);

            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.map((message) => (
                    <div key={message.id}>
                        {message.isAI ? (
                            <AIMessageText content={message.content} />
                        ) : (
                            <HumanMessageText content={message.content} />
                        )}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Chat;
