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
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div className="h-full bg-link" style={{ width: `${progress}%` }} />
      </div>

      {/* Scroll percentage indicator */}
      <div className="scroll-percentage">{Math.round(progress)}%</div>

      {/* Continue reading toast */}
      {showToast && lastPosition && (
        <div className="reading-progress-toast">
          <p className="mb-2 font-medium">Continue reading?</p>
          <p className="text-sm text-gray-600 mb-3">
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
              className="bg-link text-white px-4 py-2 rounded-md hover:bg-link-hover"
            >
              Continue
            </button>
            <button
              onClick={() => setShowToast(false)}
              className="border border-border px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
