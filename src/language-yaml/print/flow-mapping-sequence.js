"use strict";

const {
  builders: { concat, ifBreak, line, softline, hardline, join },
} = require("../../document");
const { isEmptyNode, getLast, hasEndComments } = require("../utils");
const { printNextEmptyLine, alignWithSpaces } = require("./misc");

function printFlowMapping(path, print, options) {
  const node = path.getValue();
  const isMapping = node.type === "flowMapping";
  const openMarker = isMapping ? "{" : "[";
  const closeMarker = isMapping ? "}" : "]";

  /** @type {softline | line} */
  let bracketSpacing = softline;
  if (isMapping && node.children.length > 0 && options.bracketSpacing) {
    bracketSpacing = line;
  }
  const lastItem = getLast(node.children);
  const isLastItemEmptyMappingItem =
    lastItem &&
    lastItem.type === "flowMappingItem" &&
    isEmptyNode(lastItem.key) &&
    isEmptyNode(lastItem.value);

  return concat([
    openMarker,
    alignWithSpaces(
      options.tabWidth,
      concat([
        bracketSpacing,
        printChildren(path, print, options),
        options.trailingComma === "none" ? "" : ifBreak(",", ""),
        hasEndComments(node)
          ? concat([hardline, join(hardline, path.map(print, "endComments"))])
          : "",
      ])
    ),
    isLastItemEmptyMappingItem ? "" : bracketSpacing,
    closeMarker,
  ]);
}

function printChildren(path, print, options) {
  const node = path.getValue();
  const parts = path.map(
    (childPath, index) =>
      concat([
        print(childPath),
        index === node.children.length - 1
          ? ""
          : concat([
              ",",
              line,
              node.children[index].position.start.line !==
              node.children[index + 1].position.start.line
                ? printNextEmptyLine(childPath, options.originalText)
                : "",
            ]),
      ]),
    "children"
  );
  return concat(parts);
}

module.exports = {
  printFlowMapping,
  // Alias
  printFlowSequence: printFlowMapping,
};
