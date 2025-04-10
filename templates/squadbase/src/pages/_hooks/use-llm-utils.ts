"use client";

import * as React from "react";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkDocx, { DocxOptions } from "remark-docx";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { saveAs } from "file-saver";

export type LLMUtilsProps = {
  api?: string;
};

const fetchImage = async (
  url: string
): Promise<{ image: ArrayBuffer; width: number; height: number }> => {
  const image = new Image();
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve({
        image: buf,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(new Blob([buf], { type: "image/png" }));
  });
};

export const getHtmlProcessor = () =>
  unified().use(remarkParse).use(remarkGfm).use(remarkRehype);

export const mdastLogger = () => unified().use(remarkParse);

export const getHtmlStringProcessor = () =>
  getHtmlProcessor().use(rehypeStringify);

export const useLLMUtils = (props: LLMUtilsProps) => {
  const { api = "/api/llm-util" } = props;

  const checkUtilEndpoint = React.useCallback(async () => {
    const response = await fetch(`${api}`);

    if (response.ok) {
      return true;
    } else {
      console.error("Error:", await response.json());
      return false;
    }
  }, [api]);

  const downloadPdfFromMd = React.useCallback(
    async (text: string) => {
      const htmlVFile = await getHtmlStringProcessor().process(text);
      const htmlString = String(htmlVFile);

      const response = await fetch(`${api}/html-to-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html: htmlString }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "generated.pdf";
        a.click();

        window.URL.revokeObjectURL(url);
      } else {
        console.error("Error:", await response.json());
      }
    },
    [api]
  );

  const downloadWordFromMd = React.useCallback(
    async (text: string) => {
      const docxVfile = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkDocx, {
          output: "blob",
          imageResolver: fetchImage,
        } as DocxOptions)
        .process(text);

      const blob = (await docxVfile.result) as Blob;
      saveAs(blob, "generated.docx");
    },
    [api]
  );

  const downloadMd = React.useCallback(async (text: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.md";
    a.click();

    window.URL.revokeObjectURL(url);
  }, []);

  const downloadHtml = React.useCallback(async (text: string) => {
    const htmlString = await getHtmlStringProcessor().process(text);

    const blob = new Blob([String(htmlString)], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.html";
    a.click();

    window.URL.revokeObjectURL(url);
  }, []);

  return {
    downloadPdfFromMd,
    downloadWordFromMd,
    downloadMd,
    downloadHtml,
    checkUtilEndpoint,
  };
};
