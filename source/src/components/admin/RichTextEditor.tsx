"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Code2,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

type Command =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "createLink"
  | "insertImage"
  | "removeFormat"
  | "blockquote"
  | "code";

const buttonBase =
  "h-9 w-9 inline-flex items-center justify-center rounded-md border border-transparent text-slate-700 hover:bg-slate-100 hover:border-slate-200 active:bg-slate-200 transition";

function exec(command: Command, value?: string) {
  if (command === "blockquote") {
    document.execCommand("formatBlock", false, "blockquote");
    return;
  }
  if (command === "code") {
    document.execCommand("formatBlock", false, "pre");
    return;
  }
  document.execCommand(command, false, value);
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || "";
    }
  }, [value, mounted]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
  };

  const promptForLink = () => {
    const url = window.prompt("Enter URL");
    if (url) exec("createLink", url);
  };

  const promptForImage = () => {
    const url = window.prompt("Image URL");
    if (url) exec("insertImage", url);
  };

  return (
    <div className={cn("border border-input rounded-xl bg-white shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-input bg-white rounded-t-xl text-sm">
        <button type="button" className={buttonBase} onClick={() => exec("bold")} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("italic")} aria-label="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("underline")} aria-label="Underline">
          <Underline className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("strikeThrough")} aria-label="Strike">
          <Strikethrough className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <button type="button" className={buttonBase} onClick={() => exec("formatBlock", "h1")} aria-label="H1">
          <Heading1 className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("formatBlock", "h2")} aria-label="H2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("formatBlock", "h3")} aria-label="H3">
          <Heading3 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <button type="button" className={buttonBase} onClick={() => exec("insertUnorderedList")} aria-label="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("insertOrderedList")} aria-label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("blockquote")} aria-label="Quote">
          <Quote className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("code")} aria-label="Code block">
          <Code2 className="h-4 w-4" />
        </button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <button type="button" className={buttonBase} onClick={promptForLink} aria-label="Link">
          <Link2 className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={promptForImage} aria-label="Image">
          <ImageIcon className="h-4 w-4" />
        </button>
        <button type="button" className={buttonBase} onClick={() => exec("removeFormat")} aria-label="Clear formatting">
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        {!value && placeholder && (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-slate-500">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          className="min-h-[220px] px-4 py-3 text-base leading-6 focus:outline-none prose prose-sm max-w-none text-[#111827] bg-white"
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
