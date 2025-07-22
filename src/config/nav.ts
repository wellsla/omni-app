
import {
  Home,
  FileCode2,
  SearchCode,
  Languages,
  Wand2,
  ListPlus,
  Calculator,
  Palette,
  ScanText,
  FileText,
  Info,
  PenLine,
  Code2 as CodeIcon,
  Terminal,
  Share2,
  Network,
  Boxes,
  ArrowRightLeft,
  Replace,
  KeyRound,
  LayoutGrid,
  LayoutTemplate,
  QrCode,
  Fingerprint,
  Repeat,
  Link as LinkIcon,
  Search,
  Globe,
  Gauge,
  Layers,
  Brush,
  Type,
  Clock,
  LockKeyhole,
  Minimize,
  ShieldCheck,
  Shapes,
  Lightbulb,
  FilePenLine,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface NavItemGroup {
  label: string;
  items: NavItem[];
}

export type SidebarNavItem = NavItem | NavItemGroup;

const generalNavItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/',
        icon: Home,
        description: 'An overview of all available tools and utilities.',
    },
    {
        label: 'Tips',
        href: '/tips',
        icon: Lightbulb,
        description: 'Learn how to use the tools and features in OmniApp.',
    },
]

const developerTools: NavItem[] = [
  {
    label: 'API Viewer',
    href: '/api-viewer',
    icon: Network,
    description: 'Design, visualize, and export API structures to Postman.',
  },
    {
    label: 'Base64 Converter',
    href: '/base64-converter',
    icon: Repeat,
    description: 'Encode and decode Base64 strings with real-time conversion.',
  },
    {
    label: 'Class Diagram Generator',
    href: '/class-diagram-generator',
    icon: Share2,
    description: 'Define classes and relationships to generate and export diagrams.',
  },
  {
    label: 'Code Formatter',
    href: '/code-formatter',
    icon: CodeIcon,
    description: 'Format code in languages like JS, CSS, HTML, Python, and more.',
  },
  {
    label: 'Code Playground',
    href: '/code-playground',
    icon: Terminal,
    description: 'Test and run JavaScript code snippets in a live environment.',
  },
    {
    label: 'CSS Layout Generator',
    href: '/css-layout-generator',
    icon: LayoutGrid,
    description: 'Visually create and export CSS Grid and Flexbox layouts.',
  },
  {
    label: 'Hash Generator',
    href: '/hash-generator',
    icon: Fingerprint,
    description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text.',
  },
  {
    label: 'JWT Decoder',
    href: '/jwt-decoder',
    icon: KeyRound,
    description: 'Decode and inspect JSON Web Tokens in a secure, client-side environment.',
  },
  {
    label: 'Language Converter',
    href: '/language-converter',
    icon: ArrowRightLeft,
    description: 'Translate code snippets between different programming languages.',
  },
  {
    label: 'Lorem Ipsum Generator',
    href: '/lorem-ipsum-generator',
    icon: FileText,
    description: 'Generate placeholder text in words, sentences, or paragraphs.',
  },
  {
    label: 'Markdown Previewer',
    href: '/markdown-previewer',
    icon: FileCode2,
    description: 'Write and preview Markdown with a live, side-by-side editor.',
  },
  {
    label: 'Minify/Uglify Code',
    href: '/minify-code',
    icon: Minimize,
    description: 'Reduce the file size of your code for production.',
  },
  {
    label: 'Mock Data Generation',
    href: '/mock-data-generation',
    icon: ListPlus,
    description: 'Generate mock data, including names, emails, and SQL scripts.',
  },
  {
    label: 'QR Code Generator',
    href: '/qr-code-generator',
    icon: QrCode,
    description: 'Generate and customize QR codes for URLs, text, and more.',
  },
  {
    label: 'Regex Tester',
    href: '/regex-tester',
    icon: Replace,
    description: 'Build and test regular expressions with real-time feedback.',
  },
  {
    label: 'URL Shortener',
    href: '/url-shortener',
    icon: LinkIcon,
    description: 'Create short, shareable links from long URLs.',
  },
].sort((a, b) => a.label.localeCompare(b.label));

const performanceAndTestingTools: NavItem[] = [
  {
    label: 'Browser Compatibility Checker',
    href: '/browser-compatibility-checker',
    icon: Globe,
    description: 'Analyze CSS/JS for cross-browser compatibility issues.',
  },
  {
    label: 'Lighthouse Audit',
    href: '/lighthouse-audit',
    icon: Gauge,
    description: 'Run a simulated Lighthouse audit on a website.',
  },
  {
    label: 'SEO Analyzer',
    href: '/seo-analyzer',
    icon: Search,
    description: 'Analyze on-page SEO factors of a website to find areas for improvement.',
  },
  {
    label: 'Trusted Website Checker',
    href: '/trusted-website-checker',
    icon: ShieldCheck,
    description: 'Analyze a website for trustworthiness and security signals.',
  },
].sort((a, b) => a.label.localeCompare(b.label));


const fileAndDataTools: NavItem[] = [
    {
    label: '3D Object Creator',
    href: '/3d-object-creator',
    icon: Boxes,
    description: 'Transform a series of images into an exportable 3D model.',
  },
  {
    label: 'Data Extraction',
    href: '/data-extraction',
    icon: SearchCode,
    description: 'Extract text, colors, or metadata from various file types.',
  },
  {
    label: 'Image Tools',
    href: '/image-tools',
    icon: Wand2,
    description: 'Remove backgrounds, compress, or vectorize images.',
  },
  {
    label: 'Translation',
    href: '/document-translation',
    icon: Languages,
    description: 'Translate text snippets or entire documents using AI.',
  },
].sort((a, b) => a.label.localeCompare(b.label));

const generalUtilities: NavItem[] = [
  {
    label: 'Sketchbook',
    href: '/sketchbook',
    icon: PenLine,
    description: 'A digital canvas for free-form drawing and brainstorming.',
  },
  {
    label: 'Unit & Math Calculators',
    href: '/basic-calculations',
    icon: Calculator,
    description: 'Perform unit conversions and a variety of mathematical calculations.',
  },
  {
    label: 'Wireframe Builder',
    href: '/wireframe-builder',
    icon: LayoutTemplate,
    description: 'A digital canvas to quickly build and share wireframes.',
  },
].sort((a, b) => a.label.localeCompare(b.label));

const designAndUiTools: NavItem[] = [
  {
    label: 'Color Scheme Generator',
    href: '/color-scheme-generator',
    icon: Palette,
    description: 'Generate beautiful and cohesive color palettes from a text prompt.',
  },
   {
    label: 'Document Builder',
    href: '/document-builder',
    icon: FilePenLine,
    description: 'Create and customize templates for emails and PDFs.',
  },
  {
    label: 'Icon Catalog',
    href: '/icon-catalog',
    icon: Shapes,
    description: 'Browse, customize, and copy a vast collection of SVG icons.',
  },
  {
    label: 'Font Pair Finder',
    href: '/font-pair-finder',
    icon: Type,
    description: 'Get AI-suggested Google Font pairings based on a style prompt.',
  },
   {
    label: 'Gradient Generator',
    href: '/gradient-generator',
    icon: Layers,
    description: 'Visually create and customize CSS gradients.',
  },
  {
    label: 'Shadow Generator',
    href: '/shadow-generator',
    icon: Brush,
    description: 'Visually create and customize CSS for box and text shadows.',
  },
].sort((a, b) => a.label.localeCompare(b.label));

const devOpsAndUtilities: NavItem[] = [
  {
    label: 'Cron Expression Builder',
    href: '/cron-expression-builder',
    icon: Clock,
    description: 'Visually build and understand cron expressions for scheduling tasks.',
  },
  {
    label: 'DNS Lookup Tool',
    href: '/dns-lookup',
    icon: Globe,
    description: 'Query different types of DNS records for any domain name.',
  },
  {
    label: 'Password Generator',
    href: '/password-generator',
    icon: LockKeyhole,
    description: 'Create strong, secure, and random passwords tailored to your needs.',
  },
].sort((a, b) => a.label.localeCompare(b.label));


export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
    {
        label: 'General',
        items: generalNavItems,
    },
  {
    label: 'Developer Tools',
    items: developerTools,
  },
  {
    label: 'DevOps & Utilities',
    items: devOpsAndUtilities,
  },
  {
    label: 'Performance & Testing',
    items: performanceAndTestingTools,
  },
  {
    label: 'File & Data Tools',
    items: fileAndDataTools,
  },
  {
    label: 'Design & UI Tools',
    items: designAndUiTools,
  },
  {
    label: 'General Utilities',
    items: generalUtilities,
  }
];

export const TOOL_ITEMS: NavItem[] = [
  ...developerTools,
  ...performanceAndTestingTools,
  ...fileAndDataTools,
  ...designAndUiTools,
  ...generalUtilities,
  ...devOpsAndUtilities,
].sort((a, b) => a.label.localeCompare(b.label));

// Specific icons for data extraction types, if needed later
export const DATA_EXTRACTION_TYPES = [
  { id: 'text-from-image', label: 'Text from Images', icon: ScanText },
  { id: 'text-from-pdf', label: 'Text from PDFs', icon: FileText },
  { id: 'colors-from-image', label: 'Colors from Images', icon: Palette },
];

export const TOOL_TIPS: { group: string; tips: { tool: string; tip: string; }[] }[] = [
    {
        group: 'Developer Tools',
        tips: [
            { tool: 'API Viewer', tip: 'Start by defining your basic API info. Then, add groups for related endpoints like "User Management" or "Product Catalog" to keep your API organized.' },
            { tool: 'Base64 Converter', tip: 'This tool handles Unicode characters automatically, so you can safely encode or decode text with emojis or special symbols.' },
            { tool: 'Class Diagram Generator', tip: 'Use relationships to show how classes interact. "Inheritance" is for "is-a" relationships (e.g., a Car is a Vehicle), while "Composition" is for "has-a" relationships (e.g., a Car has an Engine).' },
            { tool: 'Code Formatter', tip: 'Quickly clean up messy code by pasting it into the formatter. It supports many languages and applies standard conventions automatically.' },
            { tool: 'Code Playground', tip: 'Use `console.log()` to print variables and debug your JavaScript snippets. The output will appear in the console on the right.' },
            { tool: 'CSS Layout Generator', tip: 'Click on an item in the preview to select it and edit its specific Flexbox or Grid properties in the controls panel.' },
            { tool: 'Hash Generator', tip: 'Hashes are one-way. You cannot reverse a hash to get the original text. This is great for verifying data integrity.' },
            { tool: 'JWT Decoder', tip: 'The signature part of a JWT is used to verify its authenticity. This decoder does not perform verification, only decoding.' },
            { tool: 'Language Converter', tip: 'When converting code, the AI does its best to find equivalent libraries and idioms, but you may need to manually install dependencies or adjust the logic for complex snippets.' },
            { tool: 'Lorem Ipsum Generator', tip: 'Need placeholder text for a design? Generate a few paragraphs of Lorem Ipsum to see how your layout looks with content.' },
            { tool: 'Markdown Previewer', tip: 'Use GitHub Flavored Markdown (GFM) to create tables, task lists, and more. The preview updates live as you type.' },
            { tool: 'Minify/Uglify Code', tip: 'Minifying CSS and JS can significantly reduce your website\'s loading time. Use this tool before deploying your assets to production.' },
            { tool: 'Mock Data Generation', tip: 'In the SQL generator, use the `{{uuid}}` or `{{row_index}}` placeholders in the WHERE clause for UPDATE statements to generate unique conditions for each row.' },
            { tool: 'QR Code Generator', tip: 'Higher error correction levels (Q or H) allow the QR code to be read even if it\'s partially damaged or obscured.' },
            { tool: 'Regex Tester', tip: 'Use flags to change how the regular expression is interpreted. `g` finds all matches, `i` makes it case-insensitive, and `m` enables multi-line mode.' },
            { tool: 'URL Shortener', tip: 'Shortened URLs are great for sharing on social media or in print where space is limited.' },
        ],
    },
    {
        group: 'DevOps & Utilities',
        tips: [
            { tool: 'Cron Expression Builder', tip: 'Click on a tab (Minute, Hour, etc.) and then select "Specific" to choose individual values for that part of the schedule.'},
            { tool: 'DNS Lookup Tool', tip: 'Use the "MX" record type to find the mail servers for a domain, or "A" to find its primary IPv4 address.' },
            { tool: 'Password Generator', tip: 'A good password is both long and complex. Aim for at least 16 characters with a mix of uppercase, lowercase, numbers, and symbols.' },
        ]
    },
    {
        group: 'Performance & Testing',
        tips: [
            { tool: 'Browser Compatibility', tip: 'Focus on the recommendations for "High Impact" issues first, as these are most likely to cause problems for your users.' },
            { tool: 'Lighthouse Audit', tip: 'The Performance score is often the hardest to improve. Focus on optimizing images and reducing JavaScript execution time.' },
            { tool: 'SEO Analyzer', tip: 'Ensure your most important keyword appears in the Meta Title, Meta Description, and the H1 Heading for the best SEO impact.' },
            { tool: 'Trusted Website Checker', tip: 'A valid SSL certificate (HTTPS) and a domain that is at least a year old are two of the strongest signs of a trustworthy website.' },
        ]
    },
    {
        group: 'File & Data Tools',
        tips: [
            { tool: '3D Object Creator', tip: 'For best results, upload at least 5-10 photos of your object from many different angles, including top and bottom, with good, even lighting.' },
            { tool: 'Data Extraction', tip: 'For text extraction from images, a clear, high-contrast image with standard fonts will give the most accurate results.' },
            { tool: 'Image Tools', tip: 'The "Remove Background" tool works best with images that have a clear subject and a distinct background. The output is a transparent PNG.' },
            { tool: 'Translation', tip: 'For document translation, PDF files generally work best. The tool will extract the text content and translate it, discarding the original formatting.' },
        ],
    },
    {
        group: 'Design & UI Tools',
        tips: [
            { tool: 'Color Scheme Generator', tip: 'Be descriptive in your prompt! Instead of "blue and green," try "a serene, professional color scheme for a financial tech app using shades of teal and slate gray."' },
            { tool: 'Document Builder', tip: 'Click on an element in the live preview to select it. Its properties will appear in the panel on the right for you to customize.' },
            { tool: 'Icon Catalog', tip: 'After customizing an icon\'s size, color, and stroke, you can copy it as a React component or as raw SVG code to use anywhere.' },
            { tool: 'Font Pair Finder', tip: 'A good font pairing often involves contrast. Look for pairings that combine a serif font for headlines with a sans-serif font for body text, or vice-versa.' },
            { tool: 'Gradient Generator', tip: 'Add multiple color stops and adjust their positions to create complex and beautiful gradients. The angle control is key for linear gradients.' },
            { tool: 'Shadow Generator', tip: 'Subtle shadows often look more professional. Try a low blur radius and a semi-transparent color for a clean, modern look.' },
        ],
    },
    {
        group: 'General Utilities',
        tips: [
            { tool: 'Sketchbook', tip: 'Use the "Auto Draw" tool to have the AI clean up your rough sketches into smoother shapes.' },
            { tool: 'Unit & Math Calculators', tip: 'The calculators are organized into tabs. Switch between Arithmetic, Financial, and Conversions to find the right tool for your task.' },
            { tool: 'Wireframe Builder', tip: 'Use the keyboard arrow keys to nudge a selected element for precise positioning on the canvas.' },
        ]
    }
];
