import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function limit(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function output<T>(value: T, label?: string) {
    label ? console.log(label, value) : console.log(value);
    return value;
}
