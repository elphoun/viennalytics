/** Theme constants for background colors, gradients, and animations. */
const backgroundTheme = {
    colors: {
        primary: "#18CCFC",
        secondary: "#6344F5",
        accent: "#AE48FF",
        neutral: "#d4d4d4",
        amber: {
            amber400: "#fbbf24",
            amber500: "#f59e0b",
            amber900: "#78350f",
        },
    },
    gradients: {
        text: "bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent",
        glass: "bg-black/40 backdrop-blur-sm",
        border: "border-amber-500/30",
    },
    animations: {
        hover: "transition-all duration-300",
        scale: "hover:scale-110",
        glow: "hover:drop-shadow-lg",
    },
};

/** Utility functions for background effects and styles */
const backgroundUtils = {
    // Generate random animation delay
    getRandomDelay: () => Math.random() * 10,

    // Generate random animation duration
    getRandomDuration: () => Math.random() * 10 + 10,

    // Generate random gradient end position
    getRandomGradientEnd: () => 93 + Math.random() * 8,

    // Create glass morphism styles
    getGlassStyles: (opacity = "40") => `bg-black/${opacity} backdrop-blur-sm`,

    // Create border styles
    getBorderStyles: (color = "amber", opacity = "30") => `border-${color}-500/${opacity}`,
};

export { backgroundTheme, backgroundUtils }
