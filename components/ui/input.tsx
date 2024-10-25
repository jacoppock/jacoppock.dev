import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
    return (
        <input
            className={`px-3 py-2 border rounded-md ${className}`}
            {...props}
        />
    );
};
