#!/bin/sh
# Try to increase file watcher limit (requires privileged mode or host configuration)
# If this fails, Vite's watch.ignored config should handle it
if [ -w /proc/sys/fs/inotify/max_user_watches ]; then
  echo 524288 > /proc/sys/fs/inotify/max_user_watches 2>/dev/null || true
fi

# Start the application
exec npm run dev

