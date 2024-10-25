"use client";

import Chat from '@/components/Chat';
import { useState } from 'react';

export default function ChatPage() {
    const [response, setResponse] = useState<any>(null);

    return (
        <div className="container mx-auto p-4 h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-4 text-foreground">AI Chat</h1>
            <div className="flex-grow">
                <Chat response={response} setResponse={setResponse} />
            </div>
        </div>
    );
}
