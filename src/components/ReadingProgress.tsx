// src/components/ReadingProgress.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { saveReadingPosition, getLastPosition } from "@/utils/readingProgress";
import { throttle } from "throttle-debounce";

export default function ReadingProgress() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastPosition, setLastPosition] =
    useState<ReturnType<typeof getLastPosition>>(null);

  useEffect(() => {
    // Check for last position when component mounts
    const position = getLastPosition();
    if (position && position.url !== router.asPath) {
      setLastPosition(position);
      setShowToast(true);
    }
  }, [router.asPath]);

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      setProgress(Math.min(progress, 100));
    };

    const handleScroll = throttle(1000, () => {
      calculateProgress();
      const pageTitle =
        document.querySelector("h1")?.textContent || document.title;
      saveReadingPosition(window.location.pathname, window.scrollY, pageTitle);
    });

    window.addEventListener("scroll", handleScroll);
    calculateProgress(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-border z-50">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--color-link)",
          }}
        />
      </div>

      {/* Progress percentage indicator */}
      <div className="fixed bottom-4 left-4 bg-background/80 border border-border rounded-lg px-3 py-2 text-sm font-medium text-foreground shadow-lg z-50 backdrop-blur-sm float-on-hover">
        {Math.round(progress)}%
      </div>

      {/* Continue reading toast */}
      {showToast && lastPosition && (
        <div className="reading-progress-toast float-on-hover">
          <p className="mb-2 font-medium text-foreground">Continue reading?</p>
          <p className="text-sm text-foreground/70 mb-3">
            {lastPosition.title} (
            {Math.round(
              (lastPosition.scrollPosition /
                document.documentElement.scrollHeight) *
                100
            )}
            %)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                router.push(lastPosition.url).then(() => {
                  window.scrollTo({
                    top: lastPosition.scrollPosition,
                    behavior: "smooth",
                  });
                  setShowToast(false);
                });
              }}
              className="bg-link hover:bg-link-hover text-white px-4 py-2 rounded-md transition-colors float-on-hover"
            >
              Continue
            </button>
            <button
              onClick={() => setShowToast(false)}
              className="border border-border hover:bg-border/10 px-4 py-2 rounded-md transition-colors float-on-hover"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
