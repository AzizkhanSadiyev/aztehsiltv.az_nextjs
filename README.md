# Strafig | Incremental Progress, Irreversible Success

A modern, SEO-friendly single-page application showcasing Strafig's technical consultancy services. Built with Next.js, TypeScript, Tailwind CSS, and Framer Motion, featuring the signature "Strangler Fig" scroll animation with branching roots inspired by nature's incremental growth pattern.

## Philosophy

The **Strangler Fig** pattern is our core approach: we don't do Big Bang migrations. Instead, we incrementally envelop legacy systems with modern, resilient infrastructure until the old system is safely replaced.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Infrastructure**: Docker + Kubernetes
- **Design**: Dark mode, minimalist SRE-chic with Strafig Green (#99C2A2)

## Features

### Navigation Header
A fixed header with smooth scrolling navigation, active section highlighting, and responsive mobile menu.

### Strangler Fig Animation
A signature visual effect inspired by nature: as you scroll, a main green root line grows down the left margin, with branching roots that extend horizontally to connect each section. This animation symbolizes the incremental, organic growth of the Strangler Fig pattern.

### Sections
1. **Hero** - Incremental Progress, Irreversible Success philosophy with CTA
2. **Services** - SRE, DevOps, Cloud Migration, Strategy, and Recruiting
3. **Trainings** - Kubernetes, SRE Culture, and CI/CD workshops
4. **Testimonials** - Client success stories
5. **About** - Mission, Vision, and metrics
6. **Contact** - Functional contact form

### SEO Optimized
- Server Components for optimal SEO
- Comprehensive metadata and Open Graph tags
- Semantic HTML structure
- Fast page loads with standalone output

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Production Build

```bash
npm run build
npm start
```

### Docker Build

```bash
docker build -t strafig-web .
docker run -p 3000:3000 strafig-web
```

The Dockerfile is optimized for production with:
- Multi-stage build for minimal image size
- Node.js 24 Alpine base
- Standalone output mode
- Non-root user for security

## Kubernetes Deployment

Kubernetes manifests are located in `/k8s-manifests`:

- `deployment.yaml` - Application deployment with health checks
- `service.yaml` - ClusterIP service
- `ingress.yaml` - Nginx ingress for external access

Deploy to your cluster:

```bash
kubectl apply -f k8s-manifests/
```

## Project Structure

```
strafig-web/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Main page with all sections
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Navigation header with smooth scroll
│   ├── animations/
│   │   └── ScrollingRoot.tsx    # Strangler Fig animation with branching roots
│   └── sections/
│       ├── Hero.tsx
│       ├── Services.tsx
│       ├── Trainings.tsx
│       ├── Testimonials.tsx
│       ├── About.tsx
│       └── Contact.tsx
├── k8s-manifests/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── Dockerfile
└── README.md
```

## Design System

### Colors
- **Primary**: Strafig Green (#99C2A2)
- **Background**: Near-black (#030712)
- **Text**: Light gray (#f3f4f6)

### Typography
System font stack with emphasis on readability and performance.

### Animations
All animations use Framer Motion with careful attention to:
- Scroll-triggered reveals
- Smooth transitions
- Performance optimization

## Engineering Standards

- **TypeScript** for type safety
- **Server Components** for SEO and performance
- **Responsive Design** mobile-first approach
- **Accessibility** semantic HTML and ARIA where needed
- **Production-Ready** standalone Next.js output for Docker

## License

Proprietary - Strafig Technical Consultancy

## Contact

For inquiries: hello@strafig.com