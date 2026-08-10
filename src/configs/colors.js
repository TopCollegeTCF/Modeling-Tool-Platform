/**
 * 🎨 COLORS - Цветовая схема приложения
 * 
 * 📋 ОПИСАНИЕ:
 * Определяет все цвета используемые в приложении.
 * Поддерживает темный и светлый режимы.
 * 
 * @version 1.0.0
 * @author Gabryelf
 * @since 0.0.9
 */
 export const COLORS = {
    // Темная тема
    dark: {
        background: '#0d0d1a',
        surface: 'rgba(16, 16, 32, 0.95)',
        surfaceLight: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.08)',
        text: {
            primary: '#ffffff',
            secondary: '#888888',
            muted: '#555555',
            accent: '#4a9eff',
        },
        grid: {
            main: '#444466',
            sub: '#222244',
        },
        shadow: 'rgba(0, 0, 0, 0.3)',
    },
    // Светлая тема
    light: {
        background: '#f0f0f5',
        surface: 'rgba(255, 255, 255, 0.95)',
        surfaceLight: 'rgba(0, 0, 0, 0.05)',
        border: 'rgba(0, 0, 0, 0.1)',
        text: {
            primary: '#1a1a2e',
            secondary: '#555555',
            muted: '#999999',
            accent: '#4a9eff',
        },
        grid: {
            main: '#ccccdd',
            sub: '#eeeeee',
        },
        shadow: 'rgba(0, 0, 0, 0.1)',
    },
    // Общие цвета (не зависят от темы)
    accent: {
        blue: '#4a9eff',
        green: '#51cf66',
        red: '#ff6b6b',
        orange: '#ffa94d',
        purple: '#9775fa',
    },
    shapes: {
        cube: '#4a9eff',
        sphere: '#ff6b6b',
        cylinder: '#51cf66',
        marker: '#ffd43b',
    },
    state: {
        selected: 'rgba(74, 158, 255, 0.2)',
        hover: 'rgba(255, 255, 255, 0.05)',
        error: 'rgba(255, 80, 80, 0.15)',
        success: 'rgba(81, 207, 102, 0.15)',
    },
};