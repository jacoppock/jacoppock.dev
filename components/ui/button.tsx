import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={`px-4 py-2 rounded-md text-white ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
