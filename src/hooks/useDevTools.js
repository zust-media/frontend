import { useState, useEffect, useCallback } from 'react';

const DEVTOOLS_EVENT = 'zustmedia:devtools:toggle';

let toggleFn = null;

export function toggleDevTools() {
  if (toggleFn) {
    toggleFn();
  } else {
    console.log('[ZustMedia DevTools] 灯箱未打开，请先打开一张图片再使用此命令');
  }
}

export function initDevTools() {
  window.__zmt_tools = toggleDevTools;
  window.__zmt_tools__ = toggleDevTools;
  console.log(
    '%c[ZustMedia DevTools]%c 已就绪，打开灯箱后在控制台输入 %c__zmt_tools()%c 即可生成图片链接',
    'color: #a78bfa; font-weight: bold;',
    '',
    'color: #60a5fa; font-weight: bold;',
    ''
  );
}

export default function useDevTools() {
  const [devMode, setDevMode] = useState(false);

  toggleFn = useCallback(() => {
    setDevMode((prev) => !prev);
  }, []);

  useEffect(() => {
    initDevTools();
    return () => {
      toggleFn = null;
      delete window.__zmt_tools;
      delete window.__zmt_tools__;
    };
  }, []);

  return [devMode, setDevMode];
}
