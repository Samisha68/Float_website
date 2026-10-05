import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import { valueToEstree } from "estree-util-value-to-estree";

// Loose node shape: these run on mdast trees where the MDX node types are not in the base typings.
type Node = { type: string; name?: string | null; depth?: number; children?: Node[]; value?: string; data?: unknown };

export type TocEntry = { depth: 2 | 3; text: string; id: string };

/**
 * Exports `toc` (the page's h2/h3 headings) from every MDX file. Slugs come from github-slugger
 * run over every heading in document order, which is exactly what rehype-slug does, so the ids
 * in the table of contents match the ids on the rendered headings, duplicates included.
 */
export function remarkToc() {
  return (tree: Node) => {
    const slugger = new GithubSlugger();
    const toc: TocEntry[] = [];
    const walk = (node: Node) => {
      if (node.type === "heading") {
        const text = toString(node);
        const id = slugger.slug(text);
        if (node.depth === 2 || node.depth === 3) toc.push({ depth: node.depth, text, id });
        return;
      }
      node.children?.forEach(walk);
    };
    walk(tree);

    tree.children!.push({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [{
            type: "ExportNamedDeclaration",
            specifiers: [],
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [{ type: "VariableDeclarator", id: { type: "Identifier", name: "toc" }, init: valueToEstree(toc) }],
            },
          }],
        },
      },
    });
  };
}

/**
 * MDX treats `<Card>text</Card>` alone on a line as inline JSX inside a paragraph. The block
 * components render a <div>, and a div inside a <p> is invalid HTML (browsers split the paragraph,
 * which breaks hydration). A paragraph made up only of JSX elements is really a block, so promote it.
 * Also unwraps the paragraph MDX puts inside a raw <p>.
 */
export function remarkUnwrapJsxParagraphs() {
  return (tree: Node) => {
    const visit = (node: Node) => {
      if (!node.children) return;
      // A raw <p> in MDX gets its multi-line text parsed as a Markdown paragraph, giving <p><p>.
      if (node.type === "mdxJsxFlowElement" && node.name === "p" && node.children.length === 1 && node.children[0].type === "paragraph") {
        node.children = node.children[0].children ?? [];
      }
      node.children = node.children.flatMap((child) => {
        visit(child);
        if (child.type !== "paragraph" || !child.children) return [child];
        const parts = child.children.filter((c) => !(c.type === "text" && !c.value?.trim()));
        if (!parts.length || !parts.every((c) => c.type === "mdxJsxTextElement")) return [child];
        return parts.map((c) => ({ ...c, type: "mdxJsxFlowElement" }));
      });
    };
    visit(tree);
  };
}

type ShikiThis = { options: { lang?: string; meta?: { __raw?: string } } };
type HastElement = { properties: Record<string, unknown> };

/** Records the fence's language and title (the text after the language) on the <pre>. */
export const shikiFenceInfo = {
  name: "float-fence-info",
  pre(this: ShikiThis, node: HastElement) {
    node.properties["data-language"] = this.options.lang ?? "text";
    node.properties["data-meta"] = this.options.meta?.__raw ?? "";
  },
};
