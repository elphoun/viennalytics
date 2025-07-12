/**
 * @description ButtonProps describes the props for a button
 *
 * @property {React.ReactNode} [icon] - Optional icon to display in the button
 * @property {string} label - The text label of the button
 * @property {() => void} onClick - Function to call when the button is clicked
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {'button' | 'submit' | 'reset'} [type] - The button type attribute
 * @property {string} [className] - Additional CSS classes for the button
 */
interface ClickProps {
    icon?: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export type { ClickProps };