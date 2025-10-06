export const handleTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
        event.preventDefault();
        const focusables = Array.from(
            document.querySelectorAll<HTMLElement>(
                'input, textarea, button, [tabindex]:not([tabindex="-1"])'
            )
        );

        const currentIndex = focusables.indexOf(document.activeElement as HTMLElement);
        (document.activeElement as HTMLElement).blur();
        if (currentIndex != -1) {
            focusables[currentIndex + (event.shiftKey ? 1 : -1)].focus();
        }
    }
};