/**
 * daisyUI 主题配置 — 全部 35 个内建主题（daisyUI 5.x）
 *
 * 添加/移除主题：
 *   1. 修改此文件中的 THEMES 数组
 *   2. 同步修改 index.css 中 @plugin "daisyui" 的 themes 列表
 */

const THEMES = [
  { id: 'whitt', name: '浅色', icon: '☀️', description: '简洁明亮的默认主题' },
  { id: 'darky', name: '深色', icon: '🌙', description: '护眼舒适的深色主题' },
  { id: 'winter', name: '冬天', icon: '🌙', description: '护眼舒适的深色主题' },
  { id: 'caramellatte', name: 'Caramellatte', icon: '🌙', description: '护眼舒适的深色主题' },
  { id: 'retro', name: 'retro', icon: '🌙', description: '护眼舒适的深色主题' }
];

const DEFAULT_THEME = 'light';

const STORAGE_KEY = 'zustmedia-theme';

function isValidTheme(id) {
  return THEMES.some((t) => t.id === id);
}

export { THEMES, DEFAULT_THEME, STORAGE_KEY, isValidTheme };
