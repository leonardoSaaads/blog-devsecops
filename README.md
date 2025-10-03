# Leonardo Saads - DevSecOps Blog

Modern and minimalist blog built with Next.js 15, focused on DevSecOps, Information Security, Development, and Technology topics.

**Live Demo:** [https://blog.leonardosaads.com.br](https://blog.leonardosaads.com.br)

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage](#usage)
  - [Adding New Posts](#adding-new-posts)
  - [Customizing Content](#customizing-content)
  - [Configuring Comments](#configuring-comments)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About

This is a personal blog template designed for technical content creators, specifically those working in DevSecOps, cybersecurity, and software development fields. The blog is built with modern web technologies, prioritizing performance, simplicity, and ease of content management.

Key principles:
- **Build and Exit**: Write posts in Markdown, commit, and deploy automatically
- **Zero Backend**: Static site generation with no database or server management
- **Performance First**: Optimized for speed and SEO
- **Developer Friendly**: Clean codebase following React and Next.js best practices

---

## Features

- ✅ **MDX Support**: Write posts in Markdown with React component support
- ✅ **Syntax Highlighting**: Beautiful code blocks with highlight.js
- ✅ **Dark Mode**: Automatic theme switching with persistent preference
- ✅ **Responsive Design**: Mobile-first approach using Tailwind CSS 4.1
- ✅ **Tag System**: Organize and filter posts by topics
- ✅ **Reading Time**: Automatic calculation of estimated reading time
- ✅ **SEO Optimized**: Meta tags, semantic HTML, and OpenGraph support
- ✅ **Comments**: Integration with Giscus (GitHub Discussions)
- ✅ **Fast Loading**: Image optimization with next/image
- ✅ **Projects Showcase**: Dedicated page for portfolio projects
- ✅ **About Page**: Professional profile with social links

---

## Tech Stack

- **Framework**: [Next.js 15.5](https://nextjs.org/) with App Router
- **Language**: JavaScript (ES6+)
- **Styling**: [Tailwind CSS 4.1](https://tailwindcss.com/)
- **Content**: MDX (Markdown + JSX)
- **Deployment**: [Vercel](https://vercel.com/)
- **Comments**: [Giscus](https://giscus.app/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)

---

## Prerequisites

- **Node.js**: Version 18.x or higher (recommended: 22.x)
- **npm**: Version 9.x or higher
- **Git**: For version control

Check your versions:

```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output 9.x.x or higher
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/leonardoSaaads/blog-devsecops.git
cd blog-devsecops
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the blog.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
blog-devsecops/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout with header and footer
│   │   ├── page.js                # Homepage with hero and latest posts
│   │   ├── globals.css            # Global styles and Tailwind imports
│   │   ├── blog/
│   │   │   ├── page.js           # Blog listing page
│   │   │   └── [slug]/
│   │   │       └── page.js       # Individual post page
│   │   ├── tags/
│   │   │   ├── page.js           # All tags listing
│   │   │   └── [tag]/
│   │   │       └── page.js       # Posts filtered by tag
│   │   ├── projects/
│   │   │   └── page.js           # Projects showcase page
│   │   └── about/
│   │       └── page.js           # About/profile page
│   ├── components/
│   │   ├── Header.js             # Navigation header with theme toggle
│   │   ├── PostCard.js           # Post preview card component
│   │   ├── MDXComponents.js      # Custom MDX component styling
│   │   └── Comments.js           # Giscus comments wrapper
│   └── lib/
│       ├── posts.js              # Post reading and processing functions
│       └── utils.js              # Utility functions (date, reading time)
├── content/
│   └── posts/
│       └── *.mdx                 # Your blog posts go here
├── public/
│   ├── images/                   # Post images
│   ├── project-images/           # Project showcase images
│   └── profile-image.png         # Your profile photo
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── jsconfig.json                 # JavaScript/path configuration
└── package.json                  # Dependencies and scripts
```

---

## Usage

### Adding New Posts

Posts are written in MDX format and stored in `content/posts/`.

#### 1. Create a New MDX File

Create a file in `content/posts/` with a URL-friendly name:

```bash
content/posts/my-first-post.mdx
```

#### 2. Add Frontmatter

Every post must start with frontmatter (metadata) in YAML format:

```mdx
---
title: "My First DevSecOps Post"
date: "2025-10-03"
tags: ["devsecops", "security", "kubernetes"]
description: "A comprehensive guide to implementing security in Kubernetes clusters"
image: "/images/kubernetes-security.png"
---

# Your Content Starts Here

Write your post content in Markdown...

## Code Examples

```python
def secure_deployment():
    print("Implementing security best practices")
```

You can also use React components if needed!
```

#### 3. Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Post title (displayed in cards and page header) |
| `date` | Yes | Publication date (YYYY-MM-DD format) |
| `tags` | Yes | Array of tags for categorization |
| `description` | Yes | Short summary (displayed in post cards) |
| `image` | No | Featured image path (relative to `public/`) |

#### 4. Deploy

Commit and push your changes:

```bash
git add content/posts/my-first-post.mdx
git commit -m "Add new post about Kubernetes security"
git push origin main
```

If connected to Vercel, your site will automatically rebuild and deploy.

---

### Customizing Content

#### Personal Information

**File: `src/app/about/page.js`**

Update your profile information:

```javascript
// Update profile image path
<Image src="/profile-image.png" ... />

// Update bio text
<p>Your bio here...</p>

// Update social links
<a href="mailto:your-email@example.com" ...>
<a href="https://github.com/your-username" ...>
<a href="https://linkedin.com/in/your-profile" ...>
```

**Required Files:**
- Add your profile photo to `public/profile-image.png`

#### Projects

**File: `src/app/projects/page.js`**

Add or modify projects in the `projects` array:

```javascript
const projects = [
  {
    title: 'Project Name',
    description: 'Project description...',
    image: '/project-images/project-screenshot.png',
    url: 'https://project-url.com',
  },
  // Add more projects...
]
```

**Required Files:**
- Add project images to `public/project-images/`

#### Site Metadata

**File: `src/app/layout.js`**

Update site-wide metadata:

```javascript
export const metadata = {
  title: 'Your Name - Blog Title',
  description: 'Your blog description',
  keywords: ['keyword1', 'keyword2', ...],
}
```

#### Header/Branding

**File: `src/components/Header.js`**

Update logo and site name:

```javascript
// Update logo initials
<span className="text-white font-bold text-xl">YI</span>

// Update site name
<span className="text-xl font-bold...">Your Name</span>
```

---

### Configuring Comments

This blog uses [Giscus](https://giscus.app/) for comments, powered by GitHub Discussions.

#### Setup Steps

1. **Enable GitHub Discussions**
   - Go to your repository on GitHub
   - Navigate to `Settings` → `General` → `Features`
   - Check "Discussions"

2. **Install Giscus App**
   - Visit [github.com/apps/giscus](https://github.com/apps/giscus)
   - Click "Install" and authorize for your repository

3. **Get Configuration**
   - Visit [giscus.app](https://giscus.app/)
   - Enter your repository: `username/blog-devsecops`
   - Choose settings (category, reactions, etc.)
   - Copy the generated configuration

4. **Update Comments Component**

**File: `src/components/Comments.js`**

Replace the configuration:

```javascript
<Giscus
  repo="your-username/blog-devsecops"
  repoId="YOUR_REPO_ID"
  category="General"
  categoryId="YOUR_CATEGORY_ID"
  mapping="pathname"
  strict="0"
  reactionsEnabled="1"
  emitMetadata="0"
  inputPosition="top"
  theme="preferred_color_scheme"
  lang="pt"
  loading="lazy"
/>
```

#### Disable Comments

If you prefer not to have comments:

**File: `src/components/Comments.js`**

```javascript
export default function Comments() {
  return null // or remove the component import from post page
}
```

---

## Deployment

### Deploy to Vercel (Recommended)

#### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/leonardoSaaads/blog-devsecops)

#### Manual Deployment

1. **Create Vercel Account**
   - Sign up at [vercel.com](https://vercel.com/)
   - Connect your GitHub account

2. **Import Repository**
   - Click "Add New Project"
   - Select your forked/cloned repository
   - Vercel will auto-detect Next.js settings

3. **Configure Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `blog.leonardosaads.com.br`)
   - Follow DNS configuration instructions

4. **Environment Variables (if needed)**
   - Add any required environment variables in Project Settings

5. **Deploy**
   - Click "Deploy"
   - Future commits to `main` branch will auto-deploy

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

---

## Contributing

Contributions are welcome for bug fixes and minor improvements. However, major UI/UX changes will not be accepted to maintain the blog's design consistency.

### How to Contribute

1. **Fork the Repository**

```bash
git clone https://github.com/your-username/blog-devsecops.git
cd blog-devsecops
```

2. **Create a Feature Branch**

```bash
git checkout -b fix/your-bug-fix
```

3. **Make Your Changes**
   - Fix bugs
   - Improve documentation
   - Optimize performance
   - Add tests

4. **Commit with Clear Messages**

```bash
git commit -m "Fix: Resolve mobile navigation issue"
```

5. **Push and Create Pull Request**

```bash
git push origin fix/your-bug-fix
```

Then open a Pull Request on GitHub with a clear description.

### Contribution Guidelines

✅ **Accepted Contributions:**
- Bug fixes
- Performance improvements
- Documentation updates
- Accessibility enhancements
- Code refactoring
- Security patches

❌ **Not Accepted:**
- Major UI redesigns
- New features that change core functionality
- Changes to color schemes or layout
- Adding external services without discussion

---

## License

This project is licensed under the **MIT License** - you are free to use, modify, and distribute this software.

See the [LICENSE](LICENSE) file for full details.

### MIT License Summary

✅ Commercial use  
✅ Modification  
✅ Distribution  
✅ Private use  

⚠️ Liability and warranty not provided

---

## Contact

**Leonardo Saads Pinto**

- Website: [blog.leonardosaads.com.br](https://blog.leonardosaads.com.br)
- GitHub: [@leonardoSaaads](https://github.com/leonardoSaaads)

For bugs and feature requests, please [open an issue](https://github.com/leonardoSaaads/blog-devsecops/issues) on GitHub.

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [MDX](https://mdxjs.com/) - Markdown for the component era
- [Vercel](https://vercel.com/) - Deployment platform

---


## Arquivo de Licença

**Arquivo: `LICENSE`**

```
MIT License

Copyright (c) 2025 Leonardo Saads Pinto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
