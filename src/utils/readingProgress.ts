// src/utils/readingProgress.ts
type ReadingPosition = {
  url: string;
  scrollPosition: number;
  timestamp: number;
  title: string;
};

const MAX_STORED_POSITIONS = 10;

export function saveReadingPosition(
  url: string,
  scrollPosition: number,
  title: string
) {
  if (typeof window === "undefined") return;

  let positions = getReadingPositions();
  const entries = Object.entries(positions);

  // Remove oldest entries if we exceed the maximum
  if (entries.length >= MAX_STORED_POSITIONS) {
    const sortedEntries = entries.sort(
      (a, b) => b[1].timestamp - a[1].timestamp
    );
    const newPositions = Object.fromEntries(
      sortedEntries.slice(0, MAX_STORED_POSITIONS - 1)
    );
    positions = newPositions;
  }

  positions[url] = {
    url,
    scrollPosition,
    timestamp: Date.now(),
    title,
  };

  localStorage.setItem("readingPositions", JSON.stringify(positions));
}

export function getReadingPositions(): Record<string, ReadingPosition> {
  if (typeof window === "undefined") return {}; // Check for browser environment
  const saved = localStorage.getItem("readingPositions");
  return saved ? JSON.parse(saved) : {};
}

export function getLastPosition(): ReadingPosition | null {
  if (typeof window === "undefined") return null; // Check for browser environment
  const positions = getReadingPositions();
  const urls = Object.keys(positions);
  if (urls.length === 0) return null;

  return urls
    .map((url) => positions[url])
    .sort((a, b) => b.timestamp - a.timestamp)[0];
}
