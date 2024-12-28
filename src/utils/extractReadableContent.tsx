// src/utils/extractReadableContent.tsx
import { JSDOM } from "jsdom";

type ExtractedContent = {
  text: string;
};

async function extractReadableContent(
  html: string,
  currentUrl: string // Add this parameter
): Promise<ExtractedContent | null> {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const mainContentElement = document.querySelector(
      "#sb-site.main-content, .main-content, #sb-site"
    );

    if (!mainContentElement) {
      console.error("Could not find main content element");
      return null;
    }

    // Rewrite all internal links to use the current domain
    const links = mainContentElement.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("https://www.mctb.org")) {
        // Remove the original domain and keep the path
        const path = href.replace("https://www.mctb.org", "");
        link.setAttribute("href", path);
      }
    });

    // Remove unwanted elements
    const elementsToRemove = mainContentElement.querySelectorAll(
      'script, style, img, svg, [class*="ad"], [id*="ad"], .table-of-contents, header, footer, nav'
    );
    elementsToRemove.forEach((el) => el.remove());

    return {
      text: mainContentElement.innerHTML,
    };
  } catch (error) {
    console.error("Error extracting content:", error);
    return null;
  }
}

export default extractReadableContent;
