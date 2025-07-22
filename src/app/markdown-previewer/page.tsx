
"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const defaultMarkdown = `
# Markdown Previewer Example

This is a live Markdown previewer. Start typing in the editor on the left, and you'll see the rendered HTML on the right.

## Text Formatting
- **Bold Text:** \`**Bold Text**\`
- *Italic Text:* \`*Italic Text*\`
- \`\`\`Code Block\`\`\`
- ~~Strikethrough~~: \`~~Strikethrough~~\`

## Blockquotes
> "The greatest glory in living lies not in never falling, but in rising every time we fall." - Nelson Mandela

## Lists

**Unordered List:**
*   Item 1
*   Item 2
    *   Sub-item 2.1
    *   Sub-item 2.2

**Ordered List:**
1.  First item
2.  Second item
3.  Third item

## Code Example
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Tables (GitHub Flavored Markdown)

| Feature    | Support | Notes                        |
|------------|:-------:|------------------------------|
| Tables     |   ✔     | Using remark-gfm plugin.     |
| Task Lists |   ✔     | See below.                   |
| Emojis     |   ✔     | Handled by modern browsers. ✨|

## Task Lists
- [x] Complete Markdown Previewer feature
- [ ] Add more cool features to OmniApp
- [ ] Drink a coffee

## Links
[Visit Firebase Studio](https://firebase.google.com/studio)
`;

export default function MarkdownPreviewerPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  return (
    <>
      <PageHeader
        title="Markdown Previewer"
        description="Write Markdown on the left and see the rendered HTML preview on the right in real-time."
      />
      <div className="grid md:grid-cols-2 gap-6 h-[75vh]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Markdown Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="h-full resize-none font-mono text-sm"
              aria-label="Markdown editor"
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
