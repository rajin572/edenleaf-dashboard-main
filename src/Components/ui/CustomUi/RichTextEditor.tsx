/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Table as TableIcon,
    Undo,
    Redo,
    Trash2,
    Eye,
    Edit,
    X,
    Minus,
    Highlighter,
    Type,
    Palette,
} from "lucide-react";

interface RichTextEditorProps {
    content: string;
    setContent: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
    className?: string;
}

interface LinkDialogState {
    show: boolean;
    url: string;
}

interface TableDialogState {
    show: boolean;
    rows: number;
    cols: number;
}

type AlignType = "left" | "center" | "right";

type PasteDialogState = {
    show: boolean;
    html: string;
    text: string;
};

const stripText = (html: string) =>
    (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

/**
 * ✅ Embedded CSS - Everything is inline, no external CSS needed
 */
const EMBEDDED_STYLES = `
<style>
.rte-content { color: #2c2c2c; line-height: 1.6; }
.rte-content a { color: #8b48fb !important; text-decoration: underline !important; text-underline-offset: 2px !important; cursor: pointer; }
.rte-content a:hover { color: #8b48D0 !important; }
.rte-content hr { border: none !important; border-top: 2px solid #8b48fb !important; margin: 20px 0 !important; }
.rte-content ul { list-style-type: disc !important; padding-left: 28px !important; margin: 10px 0 !important; }
.rte-content ol { list-style-type: decimal !important; padding-left: 28px !important; margin: 10px 0 !important; }
.rte-content li { margin: 6px 0 !important; }
.rte-content .rte-table-wrap { margin: 20px 0 !important; overflow: hidden !important; border-radius: 12px !important; border: 2px solid #8b48fb !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; }
.rte-content .rte-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
.rte-content .rte-th { background: #8b48fb !important; color: white !important; font-weight: 600 !important; padding: 12px !important; border: 1px solid #28314e !important; text-align: left !important; }
.rte-content .rte-td { border: 1px solid #e2e8f0 !important; padding: 12px !important; vertical-align: top !important; word-wrap: break-word !important; }
.rte-content .rte-row-even .rte-td { background-color: #f8fafc !important; }
.rte-content .rte-table tbody tr:not(.rte-row-even) .rte-td { background-color: white !important; }
.rte-content .rte-table tbody tr:hover .rte-td { background-color: #fff3f0 !important; }
.rte-content strong, .rte-content b { font-weight: 700 !important; }
.rte-content em, .rte-content i { font-style: italic !important; }
.rte-content u { text-decoration: underline !important; }
.rte-content p { margin: 1em 0 !important; }
.rte-content p:first-child { margin-top: 0 !important; }
.rte-content p:last-child { margin-bottom: 0 !important; }
</style>
`;

/**
 * ✅ Wrap content with styles + wrapper div
 */
function wrapContentWithStyles(htmlContent: string): string {
    return `${EMBEDDED_STYLES}<div class="rte-content">${htmlContent}</div>`;
}

/**
 * ✅ Extract just the content (remove wrapper and styles) - FIXED
 */
function unwrapContent(wrappedHtml: string): string {
    if (!wrappedHtml) return '';

    // Remove the style tag
    let content = wrappedHtml.replace(/<style>[\s\S]*?<\/style>/gi, '');

    // Remove the wrapper div but keep inner content - FIXED REGEX
    content = content.replace(/<div class="rte-content">([\s\S]*)<\/div>/i, '$1');

    return content.trim();
}

/**
 * ✅ Renderer for Next.js - Just use dangerouslySetInnerHTML
 */
export function RichTextRenderer({
    html,
    className = "",
}: {
    html: string;
    className?: string;
}) {
    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: html || "" }}
        />
    );
}

/**
 * ✅ Editor component
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    setContent,
    placeholder = "Start typing...",
    minHeight = "500px",
    className = "",
}) => {


    console.log(content)

    const editorRef = useRef<HTMLDivElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
        show: false,
        url: "",
    });
    const [tableDialog, setTableDialog] = useState<TableDialogState>({
        show: false,
        rows: 3,
        cols: 3,
    });
    const [pasteDialog, setPasteDialog] = useState<PasteDialogState>({
        show: false,
        html: "",
        text: "",
    });
    const savedSelectionRef = useRef<Range | null>(null);
    const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    // Track if this is the initial load
    const isInitialLoad = useRef(true);

    // ✅ FIXED: Initialize and update editor when content changes from parent
    useEffect(() => {
        if (!editorRef.current) return;

        const unwrapped = unwrapContent(content || '');
        const currentEditorContent = editorRef.current.innerHTML;

        // Only update if content is actually different
        if (unwrapped !== currentEditorContent) {
            editorRef.current.innerHTML = unwrapped || "<p><br></p>";
            setIsEmpty(stripText(unwrapped).length === 0);
        }

        // Mark initial load as complete after first render
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
        }
    }, [content]);

    const focusEditor = () => editorRef.current?.focus();

    const handleInput = () => {
        const html = editorRef.current?.innerHTML || "";

        // Wrap with styles before saving
        const wrapped = wrapContentWithStyles(html);
        setContent(wrapped);
        setIsEmpty(stripText(html).length === 0);
    };

    const executeCommand = (command: string, value: string | null = null) => {
        if (isPreviewOpen) {
            setIsPreviewOpen(false);
            setTimeout(() => {
                focusEditor();
                document.execCommand(command, false, value ?? undefined);
                handleInput();
            }, 0);
            return;
        }
        focusEditor();
        document.execCommand(command, false, value ?? undefined);
        handleInput();
    };

    const saveSelection = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    };

    const restoreSelection = () => {
        const range = savedSelectionRef.current;
        if (!range) return;
        const sel = window.getSelection();
        if (!sel) return;
        sel.removeAllRanges();
        sel.addRange(range);
    };

    const makeSelectedLinkOpenInNewTab = () => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const node =
            sel.anchorNode?.nodeType === 3
                ? sel.anchorNode.parentElement
                : (sel.anchorNode as HTMLElement | null);

        const a = node?.closest("a");
        if (!a) return;

        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
    };

    const handleLinkClickOpenNewTab = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const a = target.closest("a") as HTMLAnchorElement | null;
        if (!a) return;

        const href = a.getAttribute("href");
        if (!href) return;

        e.preventDefault();
        e.stopPropagation();
        window.open(href, "_blank", "noopener,noreferrer");
    };

    const insertLink = () => {
        const sel = window.getSelection();
        if (!sel || !sel.toString().trim()) {
            alert("Please select text first to create a link");
            return;
        }
        saveSelection();
        setLinkDialog({ show: true, url: "" });
    };

    const applyLink = () => {
        const raw = linkDialog.url.trim();
        if (!raw) return;

        let url = raw;
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;

        setLinkDialog({ show: false, url: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("createLink", false, url);
            makeSelectedLinkOpenInNewTab();
            handleInput();
        }, 0);
    };

    const changeTextColor = (hex: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();
        document.execCommand("foreColor", false, hex);
        handleInput();
    };

    const applyFontSizePx = (px: number) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();

        document.execCommand("fontSize", false, "7");

        const root = editorRef.current;
        if (!root) return;

        const fonts = root.querySelectorAll("font[size='7']");
        fonts.forEach((f) => {
            const span = document.createElement("span");
            span.style.fontSize = `${px}px`;
            span.innerHTML = f.innerHTML;
            f.replaceWith(span);
        });

        handleInput();
    };

    const applyHighlightColor = (hex: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();

        const ok = document.execCommand("hiliteColor", false, hex);
        if (!ok) document.execCommand("backColor", false, hex);

        handleInput();
    };

    const removeHighlight = () => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();

        const ok = document.execCommand("hiliteColor", false, "transparent");
        if (!ok) document.execCommand("backColor", false, "transparent");

        handleInput();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        saveSelection();

        const html = e.clipboardData.getData("text/html");
        const text = e.clipboardData.getData("text/plain");

        if (!html) {
            setTimeout(() => {
                focusEditor();
                restoreSelection();
                document.execCommand("insertText", false, text);
                handleInput();
            }, 0);
            return;
        }

        setPasteDialog({ show: true, html, text });
    };

    const pasteKeepFormatting = () => {
        const html = pasteDialog.html;
        setPasteDialog({ show: false, html: "", text: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("insertHTML", false, html);
            handleInput();
        }, 0);
    };

    const pastePlainText = () => {
        const text = pasteDialog.text;
        setPasteDialog({ show: false, html: "", text: "" });

        setTimeout(() => {
            focusEditor();
            restoreSelection();
            document.execCommand("insertText", false, text);
            handleInput();
        }, 0);
    };

    const clearSelectedColumnStyles = () => {
        const root = editorRef.current;
        if (!root) return;

        root
            .querySelectorAll(
                'table[data-rte-table="1"] td, table[data-rte-table="1"] th'
            )
            .forEach((cell) => {
                const el = cell as HTMLElement;
                if (el.dataset.rteSelected === "1") {
                    delete el.dataset.rteSelected;
                    el.style.outline = "";
                    el.style.outlineOffset = "";
                    el.style.background = "";
                    el.style.color = "";
                }
            });
    };

    const highlightSelectedColumn = (table: HTMLTableElement, colIndex: number) => {
        clearSelectedColumnStyles();
        Array.from(table.rows).forEach((row) => {
            const cell = row.cells.item(colIndex) as HTMLElement | null;
            if (!cell) return;
            cell.dataset.rteSelected = "1";
            cell.style.outline = "2px solid rgba(173, 43, 8, 0.35)";
            cell.style.outlineOffset = "-2px";
            cell.style.background = "rgba(173, 43, 8, 0.08)";
            cell.style.color = "#000";
        });
    };

    const insertTable = () => {
        const { rows, cols } = tableDialog;

        let html = `<div class="rte-table-wrap" data-rte-wrap="1">
      <table data-rte-table="1" class="rte-table">
        <thead><tr>`;

        for (let j = 0; j < cols; j++) {
            html += `<th class="rte-th">Header ${j + 1}</th>`;
        }

        html += `</tr></thead><tbody>`;

        for (let i = 0; i < rows; i++) {
            const rowClass = i % 2 === 1 ? "rte-row-even" : "";
            html += `<tr class="${rowClass}">`;
            for (let j = 0; j < cols; j++) {
                html += `<td class="rte-td">Cell ${i + 1}-${j + 1}</td>`;
            }
            html += `</tr>`;
        }

        html += `</tbody></table></div><p><br></p>`;

        executeCommand("insertHTML", html);
        setTableDialog({ show: false, rows: 3, cols: 3 });
        setSelectedColumnIndex(null);
    };

    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        handleLinkClickOpenNewTab(e);

        const target = e.target as HTMLElement;
        const th = target.closest("th");
        const table = target.closest('table[data-rte-table="1"]');

        if (th && table) {
            const idx = (th as HTMLTableCellElement).cellIndex;
            setSelectedColumnIndex(idx);
            highlightSelectedColumn(table as HTMLTableElement, idx);
            return;
        }

        if (!table) {
            setSelectedColumnIndex(null);
            clearSelectedColumnStyles();
        }
    };

    const setTableAlign = (align: AlignType) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const anchor =
            sel.anchorNode?.nodeType === 3
                ? sel.anchorNode.parentElement
                : (sel.anchorNode as HTMLElement | null);

        const table = anchor?.closest('table[data-rte-table="1"]') as
            | HTMLTableElement
            | null;

        if (!table) {
            if (align === "left") executeCommand("justifyLeft");
            if (align === "center") executeCommand("justifyCenter");
            if (align === "right") executeCommand("justifyRight");
            return;
        }

        if (selectedColumnIndex !== null) {
            Array.from(table.rows).forEach((row) => {
                const cell = row.cells.item(selectedColumnIndex);
                if (cell) (cell as HTMLElement).style.textAlign = align;
            });
            handleInput();
            return;
        }

        const cell = anchor?.closest("td, th") as HTMLElement | null;
        if (cell) {
            cell.style.textAlign = align;
            handleInput();
        }
    };


    const applyLineHeight = (lineHeight: string) => {
        if (isPreviewOpen) setIsPreviewOpen(false);
        focusEditor();

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        // Get the selected content or current paragraph
        const range = sel.getRangeAt(0);
        let container = range.commonAncestorContainer;

        // If it's a text node, get its parent element
        if (container.nodeType === 3) {
            container = container.parentElement as Node;
        }

        // Find the closest block element (p, div, li, etc.)
        const blockElement = (container as HTMLElement).closest('p, div, li, h1, h2, h3, h4, h5, h6, td, th');

        if (blockElement) {
            (blockElement as HTMLElement).style.lineHeight = lineHeight;
            handleInput();
        }
    };

    const toggleList = (type: "ul" | "ol") => {
        const cmd = type === "ul" ? "insertUnorderedList" : "insertOrderedList";
        executeCommand(cmd);
    };

    const insertHorizontalLine = () => executeCommand("insertHorizontalRule");

    const clearFormatting = () => {
        executeCommand("removeFormat");
        executeCommand("unlink");
        handleInput();
    };

    const plainTextLength = stripText(editorRef.current?.innerHTML || "").length;
    const wordsCount = stripText(editorRef.current?.innerHTML || "")
        .split(/\s+/)
        .filter(Boolean).length;

    const ToolbarButton: React.FC<{
        onClick: () => void;
        icon: React.ReactNode;
        title: string;
        active?: boolean;
    }> = ({ onClick, icon, title, active = false }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-2.5 rounded-md transition-all duration-200 border ${active
                ? "bg-[#8b48fb] text-white border-[#8b48fb] shadow-md"
                : "bg-white border-gray-300 hover:bg-[#fff3f0] hover:border-[#8b48fb] text-[#2c2c2c]"
                }`}
        >
            {icon}
        </button>
    );

    return (
        <div className={`bg-white rounded-xl overflow-hidden border border-gray-200 ${className}`}>
            {/* Toolbar */}
            <div className="border-b border-gray-200 bg-[#efefef] p-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-sm bg-[#8b48fb] text-white hover:bg-[#8b48D0]"
                        type="button"
                    >
                        <Eye size={18} />
                        <span>Preview</span>
                    </button>

                    <div className="flex gap-1.5 pr-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => executeCommand("undo")} icon={<Undo size={18} />} title="Undo (Ctrl+Z)" />
                        <ToolbarButton onClick={() => executeCommand("redo")} icon={<Redo size={18} />} title="Redo (Ctrl+Y)" />
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Type size={16} className="text-gray-600" />
                        <select
                            onChange={(e) => applyFontSizePx(parseInt(e.target.value))}
                            className="px-3 py-2.5 border border-gray-300 rounded-md bg-white hover:border-[#8b48fb] focus:outline-none focus:ring-2 focus:ring-[#8b48fb] text-sm font-medium text-[#2c2c2c]"
                            defaultValue="16"
                            title="Text Size"
                        >
                            <option value="12">12px</option>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="18">18px</option>
                            <option value="20">20px</option>
                            <option value="24">24px</option>
                            <option value="28">28px</option>
                            <option value="32">32px</option>
                            <option value="40">40px</option>
                            <option value="48">48px</option>
                        </select>
                    </div>

                    {/* Line Height Control */}
                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <span className="text-xs font-semibold text-gray-600">Line:</span>
                        <select
                            onChange={(e) => applyLineHeight(e.target.value)}
                            className="px-3 py-2.5 border border-gray-300 rounded-md bg-white hover:border-[#8b48fb] focus:outline-none focus:ring-2 focus:ring-[#8b48fb] text-sm font-medium text-[#2c2c2c]"
                            defaultValue="1.6"
                            title="Line Height"
                        >
                            <option value="1">1.0</option>
                            <option value="1.15">1.15</option>
                            <option value="1.5">1.5</option>
                            <option value="1.6">1.6</option>
                            <option value="1.8">1.8</option>
                            <option value="2">2.0</option>
                            <option value="2.5">2.5</option>
                            <option value="3">3.0</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Palette size={16} className="text-gray-600" />
                        <label className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md bg-white hover:border-[#8b48fb] cursor-pointer">
                            <span className="text-sm font-medium text-[#2c2c2c]">Text</span>
                            <input
                                type="color"
                                defaultValue="#2c2c2c"
                                onChange={(e) => changeTextColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer"
                                title="Text Color"
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <Highlighter size={16} className="text-gray-600" />
                        <label className="flex items-center gap-2 px-2 py-1 border border-gray-300 rounded-md bg-white hover:border-[#8b48fb] cursor-pointer">
                            <span className="text-sm font-medium text-[#2c2c2c]">Highlight</span>
                            <input
                                type="color"
                                defaultValue="#fff3a3"
                                onChange={(e) => applyHighlightColor(e.target.value)}
                                className="w-8 h-8 cursor-pointer"
                                title="Highlight Color"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={removeHighlight}
                            className="px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold"
                            title="Remove Highlight"
                        >
                            Clear
                        </button>
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => executeCommand("bold")} icon={<Bold size={18} />} title="Bold (Ctrl+B)" />
                        <ToolbarButton onClick={() => executeCommand("italic")} icon={<Italic size={18} />} title="Italic (Ctrl+I)" />
                        <ToolbarButton onClick={() => executeCommand("underline")} icon={<Underline size={18} />} title="Underline (Ctrl+U)" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => executeCommand("justifyLeft")} icon={<AlignLeft size={18} />} title="Align Left" />
                        <ToolbarButton onClick={() => executeCommand("justifyCenter")} icon={<AlignCenter size={18} />} title="Align Center" />
                        <ToolbarButton onClick={() => executeCommand("justifyRight")} icon={<AlignRight size={18} />} title="Align Right" />
                        <ToolbarButton onClick={() => executeCommand("justifyFull")} icon={<AlignJustify size={18} />} title="Justify" />
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-300">
                        <span className="text-xs font-semibold text-gray-600">Table Align:</span>
                        <ToolbarButton onClick={() => setTableAlign("left")} icon={<AlignLeft size={18} />} title="Table Start" />
                        <ToolbarButton onClick={() => setTableAlign("center")} icon={<AlignCenter size={18} />} title="Table Center" />
                        <ToolbarButton onClick={() => setTableAlign("right")} icon={<AlignRight size={18} />} title="Table End" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-r border-gray-300">
                        <ToolbarButton onClick={() => toggleList("ul")} icon={<List size={18} />} title="Bullet List" />
                        <ToolbarButton onClick={() => toggleList("ol")} icon={<ListOrdered size={18} />} title="Numbered List" />
                    </div>

                    <div className="flex gap-1.5 px-3 border-x border-gray-300">
                        <ToolbarButton onClick={insertLink} icon={<LinkIcon size={18} />} title="Insert Link" />
                        <ToolbarButton onClick={() => setTableDialog({ ...tableDialog, show: true })} icon={<TableIcon size={18} />} title="Insert Table" />
                        <ToolbarButton onClick={insertHorizontalLine} icon={<Minus size={18} />} title="Insert Horizontal Line" />
                    </div>

                    <ToolbarButton onClick={clearFormatting} icon={<Trash2 size={18} />} title="Clear Formatting" />
                </div>

                {selectedColumnIndex !== null && (
                    <div className="mt-2 text-sm text-gray-600">
                        Selected column:{" "}
                        <span className="font-bold text-[#8b48fb]">{selectedColumnIndex + 1}</span>{" "}
                        (click header)
                    </div>
                )}
            </div>

            {/* Editor wrapper */}
            <div className="relative">
                {isEmpty && (
                    <div className="pointer-events-none absolute left-8 top-8 text-[#7d7f88]">
                        {placeholder}
                    </div>
                )}

                <div
                    ref={editorRef}
                    className="rte-content outline-none p-8 focus:ring-2 max-h-[70vh] focus:ring-[#8b48fb55] focus:ring-inset overflow-auto"
                    contentEditable
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onClick={handleEditorClick}
                    suppressContentEditableWarning
                    style={{
                        minHeight,
                        fontSize: "16px",
                        lineHeight: "1.6",
                        color: "#2c2c2c",
                    }}
                />
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#efefef] to-white px-6 py-4 border-t border-gray-200 text-sm text-[#2c2c2c]">
                <div className="flex justify-between items-center">
                    <span className="font-medium">
                        Characters: <span className="text-[#8b48fb] font-bold">{plainTextLength}</span>
                    </span>
                    <span className="font-medium">
                        Words: <span className="text-[#8b48fb] font-bold">{wordsCount}</span>
                    </span>
                    <span className="font-semibold flex items-center gap-2 text-[#8b48fb]">
                        <Edit size={16} />
                        Edit Mode
                    </span>
                </div>
            </div>

            {/* Preview Modal */}
            {isPreviewOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                        onClick={() => setIsPreviewOpen(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[9999] w-[min(900px,92vw)] max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center gap-2">
                                <Eye size={18} className="text-[#8b48fb]" />
                                <h3 className="text-lg font-bold text-[#2c2c2c]">Preview</h3>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                                type="button"
                            >
                                <X />
                            </button>
                        </div>

                        <div
                            className="p-6 overflow-auto"
                            style={{
                                maxHeight: "calc(85vh - 70px)",
                            }}
                            dangerouslySetInnerHTML={{ __html: content }}
                            onClick={handleLinkClickOpenNewTab as any}
                        />
                    </div>
                </>
            )}

            {/* Paste, Link, Table Dialogs - unchanged */}
            {pasteDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[9999] w-[520px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="font-bold text-[#2c2c2c]">Paste options</div>
                            <button onClick={() => setPasteDialog({ show: false, html: "", text: "" })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X /></button>
                        </div>
                        <div className="p-5 text-sm text-gray-700">
                            Choose how you want to paste:
                            <div className="mt-3 p-3 rounded-xl bg-gray-50 border text-xs text-gray-600">
                                "Keep formatting" will keep Google Docs styles (bold, headings, lists, links, tables, etc.)
                            </div>
                        </div>
                        <div className="p-5 pt-0 flex gap-3 justify-end">
                            <button className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-[#2c2c2c]" onClick={pastePlainText} type="button">Paste as plain text</button>
                            <button className="px-5 py-2.5 rounded-xl bg-[#8b48fb] hover:bg-[#8b48D0] font-semibold text-white" onClick={pasteKeepFormatting} type="button">Keep formatting</button>
                        </div>
                    </div>
                </>
            )}

            {linkDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={() => setLinkDialog({ show: false, url: "" })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl z-[9999] w-[500px] border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#2c2c2c]">Insert Link</h3>
                            <button onClick={() => setLinkDialog({ show: false, url: "" })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X size={20} /></button>
                        </div>
                        <label className="block text-sm font-semibold text-[#2c2c2c] mb-2">Enter URL</label>
                        <input type="text" value={linkDialog.url} onChange={(e) => setLinkDialog({ ...linkDialog, url: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } }} className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#8b48fb] focus:ring-4 focus:ring-[#fff3f0] transition-all text-[#2c2c2c] font-medium" autoFocus placeholder="https://example.com" />
                        <div className="flex gap-3 justify-end mt-6">
                            <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold" onClick={() => setLinkDialog({ show: false, url: "" })} type="button">Cancel</button>
                            <button className="px-6 py-3 bg-[#8b48fb] text-white rounded-xl hover:bg-[#8b48D0] font-semibold" onClick={applyLink} type="button">Insert Link</button>
                        </div>
                    </div>
                </>
            )}

            {tableDialog.show && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-2xl shadow-2xl z-[9999] w-[500px] border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#2c2c2c]">Insert Table</h3>
                            <button onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} className="p-2 rounded-lg hover:bg-gray-100" type="button"><X size={20} /></button>
                        </div>
                        <div className="space-y-5 mb-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-[#2c2c2c]">Rows</label>
                                    <span className="font-bold text-[#8b48fb]">{tableDialog.rows}</span>
                                </div>
                                <input type="range" min="1" max="20" value={tableDialog.rows} onChange={(e) => setTableDialog({ ...tableDialog, rows: parseInt(e.target.value) })} className="w-full accent-[#8b48fb]" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-[#2c2c2c]">Columns</label>
                                    <span className="font-bold text-[#8b48fb]">{tableDialog.cols}</span>
                                </div>
                                <input type="range" min="2" max="10" value={tableDialog.cols} onChange={(e) => setTableDialog({ ...tableDialog, cols: parseInt(e.target.value) })} className="w-full accent-[#8b48fb]" />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold" onClick={() => setTableDialog({ show: false, rows: 3, cols: 3 })} type="button">Cancel</button>
                            <button className="px-6 py-3 bg-[#8b48fb] text-white rounded-xl hover:bg-[#8b48D0] font-semibold" onClick={insertTable} type="button">Insert Table</button>
                        </div>
                    </div>
                </>
            )}

            {/* Add embedded styles for the editor */}
            <style dangerouslySetInnerHTML={{ __html: EMBEDDED_STYLES.replace(/<\/?style>/g, '') }} />
        </div>
    );
};

export default RichTextEditor;