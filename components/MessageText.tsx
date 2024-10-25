import Markdown from "react-markdown";

export interface MessageTextProps {
    content: string;
}

export function AIMessageText({ content }: MessageTextProps) {
    return (
        <div className="flex mr-auto w-fit max-w-[700px] bg-white border border-gray-300 rounded-md px-2 py-1 mt-3">
            <p className="text-normal text-gray-800 text-left break-words">
                <Markdown>{content}</Markdown>
            </p>
        </div>
    );
}

export function HumanMessageText({ content }: MessageTextProps) {
    return (
        <div className="flex ml-auto w-fit max-w-[700px] bg-blue-500 rounded-md px-2 py-1 mt-3">
            <p className="text-normal text-white text-left break-words">
                {content}
            </p>
        </div>
    );
}
