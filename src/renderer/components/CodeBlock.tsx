import React from "react";
import { Tooltip } from "react-tooltip";
import CodeBlockActionsButton from "./CodeBlockActionsButton";

interface CodeBlockProps {
  code: string;
  className?: string;
  conversationId: string;
  vscode: any;
}

const CodeBlock = ({
  conversationId: currentConversationId,
  code,
  className = "",
  vscode,
}: CodeBlockProps) => {
  const [codeTextContent, setCodeTextContent] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const codeRef = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    let textContent = codeRef.current?.innerText || "";

    // if it ends with a newline, remove it
    if (textContent.endsWith("\n")) {
      textContent = textContent.slice(0, -1);
    }

    setCodeTextContent(textContent);

    // set language based on hljs class
    const detectedLanguage = code.match(/language-(\w+)/)?.[1] || "";
    console.log("detected language", detectedLanguage, "from code", code);
    setLanguage(detectedLanguage);
  }, [code]);

  return (
    <pre
      className={`c-codeblock group bg-input my-4 relative rounded border bg-opacity-20
        ${className}
      `}
    >
      {language && (
        <div className="absolute -top-5 right-4 text-[10px] text-tab-inactive-unfocused">
          {language}
        </div>
      )}
      <div className="absolute top-[0.4em] right-2 flex gap-2 flex-wrap items-center justify-end rounded transition-opacity duration-75 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
        <CodeBlockActionsButton
          vscode={vscode}
          codeTextContent={codeTextContent}
          iconName="clipboard"
          tooltipContent="Copy to clipboard"
          buttonText="Copy"
          buttonSuccessText="Copied"
          onClick={() => {
            navigator.clipboard.writeText(codeTextContent);
          }}
        />

        <CodeBlockActionsButton
          vscode={vscode}
          codeTextContent={codeTextContent}
          iconName="pencil"
          tooltipContent="Insert into the current file"
          buttonText="Insert"
          buttonSuccessText="Inserted"
          onClick={() => {
            vscode.postMessage({
              type: "editCode",
              value: codeTextContent,
              conversationId: currentConversationId,
            });
          }}
        />
        <CodeBlockActionsButton
          vscode={vscode}
          codeTextContent={codeTextContent}
          iconName="plus"
          tooltipContent="Create a new file with the below code"
          buttonText="New"
          buttonSuccessText="Created"
          onClick={() => {
            vscode.postMessage({
              type: "openNew",
              value: codeTextContent,
              conversationId: currentConversationId,
              // Handle HLJS language names that are different from VS Code's language IDs
              language: language
                .replace("js", "javascript")
                .replace("py", "python")
                .replace("sh", "bash")
                .replace("ts", "typescript"),
            });
          }}
        />
        <Tooltip id="code-actions-tooltip" place="bottom" delayShow={1500} />
      </div>
      <code
        className="block px-4 py-2 overflow-x-auto bg-input font-code text-code"
        ref={codeRef}
        dangerouslySetInnerHTML={{
          __html: code
            .replace(/<pre><code[^>]*>/, "")
            .replace(/<\/code><\/pre>/, ""),
        }}
      />
    </pre>
  );
};

export default CodeBlock;
