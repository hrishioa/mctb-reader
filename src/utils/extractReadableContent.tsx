// src/utils/extractReadableContent.tsx
import { JSDOM } from "jsdom";

type ExtractedContent = {
  text: string;
  title?: string;
};

async function extractReadableContent(
  html: string,
  currentUrl: string
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

    // Clean up span elements with property attributes
    const propertySpans = mainContentElement.querySelectorAll("span[property]");
    propertySpans.forEach((span) => {
      const text = span.textContent || "";
      const textNode = document.createTextNode(text);
      span.parentNode?.replaceChild(textNode, span);
    });

    // Find and extract the title
    let title = "";
    const h1 = mainContentElement.querySelector("h1");
    if (h1) {
      title = h1.textContent || "";
      // Remove the original h1 as we'll render it in our React component
      h1.remove();
    }

    // Rewrite links
    const links = mainContentElement.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("https://www.mctb.org")) {
        const path = href.replace("https://www.mctb.org", "");
        link.setAttribute("href", path);
      }
    });

    // Remove unwanted elements
    const elementsToRemove = mainContentElement.querySelectorAll(
      'script, style, img, svg, [class*="ad"], [id*="ad"], .table-of-contents, header, footer, nav, .breadcrumbs'
    );
    elementsToRemove.forEach((el) => el.remove());

    // Clean up any remaining HTML artifacts
    const content = mainContentElement.innerHTML
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .trim();

    return {
      text: content,
      title,
    };
  } catch (error) {
    console.error("Error extracting content:", error);
    return null;
  }
}

export default extractReadableContent;
