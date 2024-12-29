// pages/[[...slug]].tsx
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import extractReadableContent from "@/utils/extractReadableContent";
import ModifiedLink from "@/components/ModifiedLink";
import { JSDOM } from "jsdom";
import ReadingProgress from "../components/ReadingProgress";
import ThemeToggle from "../components/ThemeToggle";
import { ThemeProvider } from "../contexts/ThemeContext";

type Props = {
  extractedContent: { text: string; title?: string } | null;
  links: Array<{
    href: string;
    innerHTML: string;
  }>;
};

const ArticlePage: NextPage<Props> = ({ extractedContent, links }) => {
  if (!extractedContent) {
    return <div>Failed to load content</div>;
  }

  const title = extractedContent.title || links[0]?.innerHTML || "Reading";

  return (
    <ThemeProvider>
      <Head>
        <title>{title} - Reader</title>
      </Head>
      <div className="content-container">
        <ThemeToggle />
        <ReadingProgress />
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: extractedContent.text }}
        />
      </div>
    </ThemeProvider>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const { slug } = context.params || {};
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
      },
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return {
      props: {
        extractedContent: null,
        links: [],
      },
    };
  }
};

export default ArticlePage;
