// pages/[[...slug]].tsx
import type { GetServerSideProps, NextPage } from "next";
import extractReadableContent from "@/utils/extractReadableContent";
import ModifiedLink from "@/components/ModifiedLink";
import { JSDOM } from "jsdom"; // Add this import
import "../styles/globals.css";

type Props = {
  extractedContent: { text: string } | null;
  links: Array<{
    href: string;
    innerHTML: string;
  }>;
  externalProcessOutput: string | null; // Changed to include null
};

const ArticlePage: NextPage<Props> = ({
  extractedContent,
  links,
  externalProcessOutput,
}) => {
  if (!extractedContent) {
    return <div>Failed to load content</div>;
  }

  return (
    <div className="content-container">
      <div dangerouslySetInnerHTML={{ __html: extractedContent.text }} />
      {/* Rest of the component */}
    </div>
  );
};

// src/pages/[[...slug]].tsx
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const { slug } = context.params;
  const baseUrl = "https://www.mctb.org/mctb2/";
  const url = `${baseUrl}${Array.isArray(slug) ? slug.join("/") : slug || ""}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const extractedContent = await extractReadableContent(
      html,
      context.req.headers.host || ""
    );

    // Process links on the server side
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const mainContentElement = document.querySelector(
      "#sb-site.main-content, .main-content, #sb-site"
    );

    const links = mainContentElement
      ? Array.from(mainContentElement.querySelectorAll("a")).map((link) => {
          const href = link.getAttribute("href") || "";
          const isExternal =
            href.startsWith("http") && !href.includes("mctb.org");
          return {
            href: isExternal ? href : href.replace("https://www.mctb.org", ""),
            innerHTML: link.innerHTML,
          };
        })
      : [];

    return {
      props: {
        extractedContent,
        links,
        externalProcessOutput: null,
      },
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return {
      props: {
        extractedContent: null,
        links: [],
        externalProcessOutput: null,
      },
    };
  }
};

export default ArticlePage;
