import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const cache = new Map();
const listeners = new Set();

function notifyAll() {
  listeners.forEach((fn) => fn());
}

let pendingUuids = [];
let debounceTimer = null;

function flushLookup() {
  const uuids = [...pendingUuids];
  pendingUuids = [];
  if (uuids.length === 0) return;
  api.lookupUsers(uuids).then((data) => {
    if (data.users) {
      Object.entries(data.users).forEach(([uuid, info]) => {
        cache.set(uuid, { name: info.nickname || info.username, username: info.username, slug: info.slug });
      });
    }
    uuids.forEach((uuid) => {
      if (!cache.has(uuid)) cache.set(uuid, null);
    });
    notifyAll();
  }).catch(() => {
    uuids.forEach((uuid) => {
      if (!cache.has(uuid)) cache.set(uuid, null);
    });
    notifyAll();
  });
}

function scheduleLookup(uuid) {
  if (!uuid || cache.has(uuid)) return;
  if (!pendingUuids.includes(uuid)) pendingUuids.push(uuid);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushLookup, 50);
}

function subscribe(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(uuid) {
  return cache.get(uuid);
}

function useUserInfo(uuid) {
  const subscribeUuid = useCallback(
    (onStoreChange) => subscribe(onStoreChange),
    []
  );
  const getSnap = useCallback(() => getSnapshot(uuid), [uuid]);
  return useSyncExternalStore(subscribeUuid, getSnap);
}

export default function UserDisplay({ uuid, showLink = true, className = '' }) {
  const info = useUserInfo(uuid);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    setTriggered(false);
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;
    if (cache.has(uuid)) return;
    if (triggered) return;
    setTriggered(true);
    scheduleLookup(uuid);
  }, [uuid, triggered]);

  if (!uuid) {
    return <span className={className}>匿名</span>;
  }

  if (info === undefined) {
    return <span className={`text-base-content/40 ${className}`}>...</span>;
  }

  if (info === null) {
    return showLink ? (
      <Link to={`/user/${uuid}`} className={`hover:text-primary transition-colors ${className}`}>
        {uuid.substring(0, 8)}
      </Link>
    ) : (
      <span className={className}>{uuid.substring(0, 8)}</span>
    );
  }

  const slug = info.slug || uuid;

  if (showLink) {
    return (
      <Link to={`/user/${slug}`} className={`hover:text-primary transition-colors ${className}`}>
        {info.name}
      </Link>
    );
  }

  return <span className={className}>{info.name}</span>;
}
