import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    "intro",
    {
      type: "category",
      label: "LINE Cookbook",
      items: [
        "line/echo-bot",
        "line/error-handling",
        "line/testing",
        "line/routing",
        "line/rich-messages",
      ],
    },
    {
      type: "category",
      label: "Concepts",
      items: ["concepts/services", "concepts/errors", "concepts/testing"],
    },
  ],
};

export default sidebars;
