import { useState, useEffect, useRef } from 'react';
import { FiServer, FiRefreshCw } from 'react-icons/fi';
import { api } from '../services/api';

export default function ConnectionStatus() {
  const [online, setOnline] = useState(false);
  const [latency, setLatency] = useState(null);
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const failCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const check = async () => {
      setChecking(true);
      const start = performance.now();
      try {
        await api.getConfig();
        const ms = Math.round(performance.now() - start);
        if (!cancelled) {
          failCountRef.current = 0;
          setOnline(true);
          setLatency(ms);
          setRetryCount(0);
          setInitialCheckDone(true);
        }
      } catch {
        if (!cancelled) {
          failCountRef.current++;
          setInitialCheckDone(true);
          if (failCountRef.current >= 2) {
            setOnline(false);
            setLatency(null);
            setRetryCount((c) => c + 1);
          }
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    const schedule = () => {
      const interval = online ? 3000 : 1000;
      timer = setTimeout(() => {
        check().finally(() => {
          if (!cancelled) schedule();
        });
      }, interval);
    };

    check().finally(() => {
      if (!cancelled) schedule();
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [online]);

  const prevOnlineRef = useRef(false);
  const reconnectedRef = useRef(false);

  useEffect(() => {
    if (online && !prevOnlineRef.current && initialCheckDone && !reconnectedRef.current) {
      reconnectedRef.current = true;
      window.dispatchEvent(new CustomEvent('zustmedia:reconnected'));
    }
    if (!online) {
      reconnectedRef.current = false;
    }
    prevOnlineRef.current = online;
  }, [online, initialCheckDone]);

  const isInitialConnecting = !initialCheckDone;

  return (
    <>
      {/* 导航栏指示器 */}
      <div
        className="flex items-center gap-1 text-xs cursor-default"
        title={online ? `后端已连接 · ${latency}ms` : `后端连接失败 · 已重试 ${retryCount} 次`}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
            online ? 'bg-success' : isInitialConnecting || checking ? 'bg-warning' : 'bg-error'
          }`}
        />
        <span className="text-base-content/50 hidden sm:inline">
          {isInitialConnecting ? '连接中...' : online ? `${latency}ms` : '离线'}
        </span>
      </div>

      {/* 全屏离线遮罩 */}
      {!online && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-base-300/95 backdrop-blur-sm">
          <div className="text-center space-y-5 max-w-md px-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-error/20 flex items-center justify-center">
              <FiServer size={36} className="text-error" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                {isInitialConnecting ? '正在连接服务器' : '服务器已离线'}
              </h2>
              <p className="mt-2 text-base-content/60 text-sm">
                {isInitialConnecting
                  ? '正在尝试连接后端服务，请稍候...'
                  : '无法连接到后端服务，请检查服务器是否正常运行'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-base-content/40">
                <FiRefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                <span>
                  {isInitialConnecting
                    ? '首次连接...'
                    : checking
                      ? '正在尝试重新连接...'
                      : retryCount > 0
                        ? `已重试 ${retryCount} 次，将继续自动尝试`
                        : '检测到连接断开，即将自动重试'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
