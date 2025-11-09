export const windowPreferences = (width: number, height: number) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const left = (screenWidth / 2) - (width / 2);
    const top = (screenHeight / 2) - (height / 2);

    return `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`;
}