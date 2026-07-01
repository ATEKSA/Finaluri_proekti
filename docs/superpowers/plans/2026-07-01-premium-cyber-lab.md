# Premium Cyber Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Chemistry Bonding Sandbox app and its presentation with a Premium Cyber Lab aesthetic, featuring 3D-shaded atoms, moving electron pulses on bonds, and glassmorphic card overlays.

**Architecture:** Use advanced SVG radial gradients with shifted light centers to render 3D-looking spheres. Use SVG `animateMotion` elements to flow electron pulses along bonds, and upgrade index.css with scrolling cyber-grids and glassmorphism.

**Tech Stack:** React, Vite, TypeScript, SVG, Vanilla CSS.

---

### Task 1: Background Grid & Glassmorphism Styling

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add scrolling cyber grid animations and glassmorphic panel upgrades**

Add to `src/index.css`:
```css
/* Cyber Grid & Glassmorphism Upgrades */
@keyframes cyber-grid-scroll {
  from { background-position: 0 0; }
  to { background-position: 48px 48px; }
}

.cyber-grid-bg {
  background-image: 
    linear-gradient(rgba(0, 242, 254, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 254, 0.015) 1px, transparent 1px);
  background-size: 48px 48px;
  animation: cyber-grid-scroll 18s linear infinite;
}

.glass-panel-upgrade {
  background: rgba(10, 15, 30, 0.65) !important;
  backdrop-filter: blur(16px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(16px) saturate(120%) !important;
  border: 1px solid rgba(0, 242, 254, 0.12) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

.sandbox-svg.cyber-grid-bg {
  background-color: #070912;
  background-image:
    radial-gradient(ellipse at 20% 50%, rgba(0, 242, 254, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.03) 0%, transparent 50%),
    linear-gradient(rgba(0, 242, 254, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 254, 0.015) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 48px 48px, 48px 48px;
  animation: cyber-grid-scroll 24s linear infinite;
}
```

- [ ] **Step 2: Add these class names to the Sandbox wrapper in Sandbox.tsx**

Modify `src/components/Sandbox.tsx`:
```tsx
// Around line 418, replace the wrappers with new styling:
<div className="sandbox-layout animate-fade-in">
  <div className="sandbox-grid-container">
    <div className="sandbox-sidebar glass-panel glass-panel-upgrade">
...
<div className="sandbox-canvas-wrapper glass-panel glass-panel-upgrade">
...
<svg
  ref={canvasRef}
  className="sandbox-svg cyber-grid-bg"
```

- [ ] **Step 3: Run build to verify compilation**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 4: Commit changes**

```bash
git add src/index.css src/components/Sandbox.tsx
git commit -m "style: add cyber-grid background and glassmorphism styling"
```

---

### Task 2: 3D Spherical Atoms & Shadows

**Files:**
- Modify: `src/components/Sandbox.tsx`

- [ ] **Step 1: Rewrite radial gradient definitions to create 3D shading**

Replace the `gradientDefs` variable in `src/components/Sandbox.tsx` (around lines 407-413) with 3D radial gradients:
```tsx
  const gradientDefs = Object.entries(ATOM_DEFS).map(([sym, def]) => (
    <radialGradient key={sym} id={`atomGrad_${sym}`} cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
      <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
      <stop offset="20%"  stopColor={def.color} stopOpacity="0.85" />
      <stop offset="70%"  stopColor={def.color} stopOpacity="0.4" />
      <stop offset="100%" stopColor="#010204" stopOpacity="0.95" />
    </radialGradient>
  ));
```

- [ ] **Step 2: Add drop-shadow filter to defs**

Add this filter element inside the `<defs>` block in `src/components/Sandbox.tsx` (around line 584):
```tsx
              <filter id="atom3dShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="4" dy="10" stdDeviation="6" floodColor="#000000" floodOpacity="0.55" />
              </filter>
```

- [ ] **Step 3: Apply 3D gradients and drop-shadows to atom renderers**

In `src/components/Sandbox.tsx` (around lines 650-680), update the main `<circle>` of the atom renderer to use the filter and the 3D gradient fill:
```tsx
                {/* Nucleus body */}
                <circle
                  cx="0" cy="0"
                  r={def.radius}
                  fill={`url(#atomGrad_${atom.symbol})`}
                  filter="url(#atom3dShadow)"
                  stroke={isSelected ? '#00f2fe' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  style={{ transition: 'stroke 0.2s ease' }}
                />
```

- [ ] **Step 4: Run build to verify compilation**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/Sandbox.tsx
git commit -m "feat: add 3D radial gradients and drop-shadows to atoms"
```

---

### Task 3: Animated Electron Pulses on Active Bonds

**Files:**
- Modify: `src/components/Sandbox.tsx`

- [ ] **Step 1: Add a moving electron pulse to covalent/ionic bonds**

In `src/components/Sandbox.tsx` (around lines 610-630), inside the bonds mapping, render an electron pulse `<circle>` moving along the bond line using SVG `animateMotion`:
```tsx
              return (
                <g key={bond.id} className={bond.isNew ? 'bond-glow' : ''}>
                  {/* glow trail */}
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={glowColor} strokeWidth="8" opacity="0.18" filter="url(#glow)" />
                  {/* main line */}
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={bondColor} strokeWidth={isIonic ? 2.5 : 3}
                    strokeDasharray={isIonic ? '5 4' : '0'}
                    strokeDashoffset={bond.isNew ? bondLen : 0}
                    style={bond.isNew ? { transition: 'stroke-dashoffset 0.5s ease' } : {}}
                  />
                  {/* traveling electron pulse dot */}
                  <circle r="4" fill="#39ff14" filter="url(#glow)">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      path={`M ${start.x} ${start.y} L ${end.x} ${end.y}`}
                    />
                  </circle>
                  {/* center dot */}
                  <circle cx={(start.x + end.x) / 2} cy={(start.y + end.y) / 2}
                    r="3" fill={bondColor} opacity="0.7" />
                </g>
              );
```

- [ ] **Step 2: Run build to verify compilation**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit changes**

```bash
git add src/components/Sandbox.tsx
git commit -m "feat: add animated electron pulses traveling along chemical bonds"
```

---

### Task 4: UI Card & Pedestal Glassmorphism Upgrades

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Modify puzzle card styling for holographic look**

Modify `.puzzle-card` and `.podium-card` classes in `src/index.css`:
```css
.puzzle-card {
  background: rgba(10, 15, 30, 0.6) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.puzzle-card.unlocked:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(0, 242, 254, 0.25) !important;
  box-shadow: 0 15px 45px rgba(0, 242, 254, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

.podium-card {
  background: rgba(10, 15, 30, 0.5) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(0, 242, 254, 0.08) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
}
```

- [ ] **Step 2: Run build to verify compilation**

Run: `npm run build`
Expected: SUCCESS

- [ ] **Step 3: Commit changes**

```bash
git add src/index.css
git commit -m "style: upgrade puzzle selector and leaderboard podium glassmorphism"
```

---

### Task 5: Presentation Upgrade & 3D Atoms Slide

**Files:**
- Modify: `presentation.html`

- [ ] **Step 1: Update total slides count to 11 and add slide 9**

In `presentation.html` (around line 830), change `const totalSlides = 10;` to `const totalSlides = 11;`.
Modify `presentation.html` slides numbering from slide 9 to 10, slide 10 to 11.
Add new Slide 9 (right before conclusion, around line 790):
```html
      <!-- ==================== SLIDE 9: 3D ATOMS ==================== -->
      <div class="slide" data-slide="9">
        <div class="header-tag">3D ატომები & დინამიკური ბმები</div>
        <div class="slide-body">
          <h2 class="content-title">ატომების 3D სფერული მოდელირება</h2>
          <div class="grid-2col" style="margin-top: 20px;">
            <ul class="tech-list">
              <li><strong>სფერული მოცულობა:</strong> სინათლის წერტილის გადაადგილებითა და რადიალური გრადიენტებით მიღწეულია რეალისტური 3D ეფექტი.</li>
              <li><strong>მოძრავი ელექტრონები:</strong> ბმებზე ჩნდებიან მოძრავი მანათობელი იმპულსები, რომლებიც მოსწავლეს აჩვენებენ ელექტრონების რეალურ გაზიარებას.</li>
              <li><strong>საგანმანათლებლო ეფექტი:</strong> აუმჯობესებს აღქმას და ააქტიურებს მოსწავლის ინტერესს ინტერაქტიული ქიმიისადმი.</li>
            </ul>
            <div class="atom-art">
              <div class="nucleus" style="background: radial-gradient(circle at 30% 30%, #ffffff 0%, #00f2fe 50%, #030408 100%); width: 120px; height: 120px;">3D</div>
              <div class="orbit o-1" style="border-style: solid; width: 280px; height: 280px;">
                <div class="dot-electron dot-e1"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-info">
          <div class="author-details">
            <span class="author-name">The Bonding Sandbox</span>
            <span class="author-role">3D მოდელირება</span>
          </div>
          <div class="event-details">Slide 9 / 11</div>
        </div>
      </div>
```

- [ ] **Step 2: Update the slide numbers in the footer of subsequent slides**

Modify slide 10 (formerly 9) footer Event Details to "Slide 10 / 11".
Modify slide 11 (formerly 10) footer Event Details to "Slide 11 / 11".

- [ ] **Step 3: Test presentation in browser**

Run: `Start-Process "presentation.html"`
Expected: Clean visual rendering and navigation through 11 slides.

- [ ] **Step 4: Commit changes and push**

```bash
git add presentation.html
git commit -m "feat: add 3D atoms slide and update presentation to 11 slides"
git push origin main
```
