
export function plateNodesToHtml(nodes) {
  if (!nodes) return "";
  return nodes.map(nodeToHtml).join("");
}

function nodeToHtml(node) {
  if (node.text !== undefined) {
    // leaf text node
    return escapeHtmlWithMarks(node);
  }

  const type = node.type || "p";
  const inner = (node.children || []).map(nodeToHtml).join("");

  switch (type) {
    case "h1":
      return `<h1>${inner}</h1>`;
    case "h2":
      return `<h2>${inner}</h2>`;
    case "h3":
      return `<h3>${inner}</h3>`;
    case "h4":
      return `<h4>${inner}</h4>`;
    case "h5":
      return `<h5>${inner}</h5>`;
    case "h6":
      return `<h6>${inner}</h6>`;
    case "ul":
    case "ul_list":
      return `<ul>${inner}</ul>`;
    case "ol":
    case "ol_list":
      return `<ol>${inner}</ol>`;
    case "li":
    case "list-item":
      return `<li>${inner}</li>`;
    case "blockquote":
      return `<blockquote>${inner}</blockquote>`;
    case "code":
      return `<pre><code>${inner}</code></pre>`;
    case "a":
      {
        const url = node.url || node.href || "#";
        return `<a href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
      }
    default:
      return `<p>${inner}</p>`;
  }
}

function escapeHtmlWithMarks(leaf) {
  let text = escapeHtml(String(leaf.text || ""));
  // apply marks in a stable order
  if (leaf.bold) text = `<strong>${text}</strong>`;
  if (leaf.italic) text = `<em>${text}</em>`;
  if (leaf.underline) text = `<u>${text}</u>`;
  if (leaf.code) text = `<code>${text}</code>`;
  if (leaf.strikethrough) text = `<del>${text}</del>`;
  return text;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Very small HTML -> Plate nodes converter (best-effort).
export function htmlToPlateNodes(html) {
  if (!html) return [{ type: "p", children: [{ text: "" }] }];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;
    const nodes = Array.from(body.childNodes).map(elToNode).flat();
    return nodes.length ? nodes : [{ type: "p", children: [{ text: "" }] }];
  } catch (e) {
    // fallback to a single paragraph node with plain text
    return [{ type: "p", children: [{ text: stripTags(html) }] }];
  }
}

function elToNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return { text: node.textContent || "" };
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return [];

  const tag = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map(elToNode).flat();

  switch (tag) {
    case "p":
      return [{ type: "p", children: children.length ? children : [{ text: "" }] }];
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return [{ type: tag.toLowerCase(), children: children.length ? children : [{ text: "" }] }];
    case "ul":
      return [{ type: "ul", children: children }];
    case "ol":
      return [{ type: "ol", children: children }];
    case "li":
      return [{ type: "li", children: children.length ? children : [{ text: "" }] }];
    case "strong":
    case "b":
      return children.map((c) => applyMark(c, "bold"));
    case "em":
    case "i":
      return children.map((c) => applyMark(c, "italic"));
    case "u":
      return children.map((c) => applyMark(c, "underline"));
    case "code":
      return [{ type: "code", children: children.length ? children : [{ text: "" }] }];
    case "pre":
      return [{ type: "code", children: children.length ? children : [{ text: "" }] }];
    case "a":
   
      const href = node.getAttribute("href") || node.getAttribute("data-href") || "";
      return [{ type: "a", url: href, children: children.length ? children : [{ text: "" }] }];
    default:
    
      return children.length ? children : [{ text: "" }];
  }
}

function applyMark(node, mark) {
  if (node.text !== undefined) {
    return { ...node, [mark]: true };
  }
  if (node.children) {
    return { ...node, children: node.children.map((c) => applyMark(c, mark)) };
  }
  return node;
}

function stripTags(str) {
  return str.replace(/<[^>]*>/g, "");
}
