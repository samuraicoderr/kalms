# DESIGN.md

## Kalms — Design System & Product UI Guidelines

---

# Overview

Kalms is an AI-powered mental wellness support platform designed for university students.

The platform focuses on:

* emotional safety,
* clarity,
* calmness,
* accessibility,
* and modern product aesthetics.

The design language should feel:

* soft,
* intelligent,
* emotionally supportive,
* modern,
* premium,
* and minimal.

Kalms should never feel:

* overly clinical,
* robotic,
* crowded,
* childish,
* or visually stressful.

The goal is to make students feel:

* welcomed,
* safe,
* understood,
* and comfortable interacting with the platform daily.

---

# Brand Identity

## Brand Name

**Kalms**

The name represents:

* calmness,
* emotional stability,
* mental balance,
* and peace of mind.

---

# Brand Personality

Kalms should feel:

* emotionally supportive,
* modern,
* trustworthy,
* intelligent,
* warm,
* youthful,
* and peaceful.

The tone should resemble:

* a modern wellness startup,
* not a hospital management system.

---

# Logo System

Kalms uses 4 official logo variants.

## 1. Purple Logo

Primary brand logo.

### Usage

* light backgrounds
* authentication pages
* dashboards
* marketing materials
* landing pages

### Color

```css
#3a0c8a
```

---

## 2. White Logo

Used on dark or colored backgrounds.

### Usage

* dark hero sections
* overlays
* splash screens
* gradients
* modal headers

---

## 3. Black Logo

Used for:

* monochrome printing
* documentation
* low-color environments

---

## 4. Grey Logo

Used primarily for:

* loading screens
* skeleton states
* placeholders
* inactive states

### Recommended Color

```css
#9ca3af
```

---

# Core Theme Color

## Primary Brand Color

```css
#3a0c8a
```

This purple is the emotional anchor of the platform.

It represents:

* calmness,
* trust,
* intelligence,
* reflection,
* emotional stability.

---

# Color Palette

## Primary Colors

### Primary Purple

```css
#3a0c8a
```

### Primary Purple Hover

```css
#4c13b5
```

### Primary Purple Light

```css
#ede7ff
```

### Deep Purple

```css
#24055c
```

---

## Secondary Colors

### Soft Blue

```css
#dbeafe
```

### Soft Lavender

```css
#f3e8ff
```

### Calm Green

```css
#dcfce7
```

### Warm White

```css
#fafafa
```

---

# Status Colors

## Healthy

```css
#22c55e
```

## At Risk

```css
#f59e0b
```

## Distressed

```css
#ef4444
```

These colors should always remain soft and accessible.

Avoid overly saturated red tones.

---

# Neutral Palette

## Background

```css
#ffffff
```

## Secondary Background

```css
#f8fafc
```

## Card Background

```css
#ffffff
```

## Border Color

```css
#e5e7eb
```

## Text Primary

```css
#111827
```

## Text Secondary

```css
#6b7280
```

## Muted Text

```css
#9ca3af
```

---

# Typography

## Font Style

Recommended Fonts:

* Inter
* Plus Jakarta Sans
* Manrope

Primary recommendation:

```css
font-family: 'Inter', sans-serif;
```

---

# Typography Scale

## Display Heading

```css
48px
font-weight: 700
```

## Page Heading

```css
36px
font-weight: 700
```

## Section Heading

```css
24px
font-weight: 600
```

## Card Title

```css
18px
font-weight: 600
```

## Body Text

```css
16px
font-weight: 400
```

## Small Text

```css
14px
font-weight: 400
```

---

# Design Principles

## 1. Emotional Comfort First

Every screen should reduce emotional stress.

Avoid:

* clutter,
* excessive notifications,
* visual overload,
* sharp edges,
* aggressive contrasts.

---

## 2. Calm Interfaces

Use:

* generous whitespace,
* soft shadows,
* smooth gradients,
* rounded corners,
* subtle animations.

---

## 3. Accessibility

Design must support:

* readable typography,
* sufficient contrast,
* keyboard navigation,
* responsive layouts,
* screen readers.

---

## 4. Minimal Cognitive Load

The platform should feel easy to understand immediately.

One primary action per section.

Avoid overwhelming users.

---

# UI Style

## Card Design

Cards are the primary UI container.

### Style

```css
border-radius: 24px;
background: white;
box-shadow: 0 8px 30px rgba(0,0,0,0.05);
padding: 24px;
```

---

# Border Radius System

## Small

```css
12px
```

## Medium

```css
18px
```

## Large

```css
24px
```

## Pills / Buttons

```css
999px
```

---

# Shadows

## Soft Shadow

```css
0 8px 30px rgba(0,0,0,0.05)
```

## Hover Shadow

```css
0 12px 40px rgba(58,12,138,0.15)
```

---

# Buttons

## Primary Button

### Style

* Purple background
* White text
* Rounded pill shape
* Medium shadow

### CSS

```css
background: #3a0c8a;
color: white;
border-radius: 999px;
padding: 14px 24px;
```

---

## Secondary Button

### Style

* Light purple background
* Purple text

---

## Ghost Button

### Style

* Transparent
* Purple border
* Purple text

---

# Inputs

## Input Style

```css
border: 1px solid #e5e7eb;
border-radius: 18px;
padding: 14px 18px;
background: white;
```

### Focus State

```css
border-color: #3a0c8a;
box-shadow: 0 0 0 4px rgba(58,12,138,0.1);
```

---

# Layout System

## Sidebar Width

```css
280px
```

---

## Main Container Width

```css
max-width: 1440px
```

---

## Grid Gap

```css
24px
```

---

# Dashboard Design

## Dashboard Feel

The dashboard should feel:

* peaceful,
* informative,
* motivating,
* emotionally intelligent.

---

## Dashboard Sections

### Greeting Section

Contains:

* greeting text,
* date,
* motivational message,
* wellness illustration.

---

## Quick Check-In Widget

Includes:

* Mood slider,
* Energy slider,
* Stress slider,
* Save button.

Must feel:

* lightweight,
* interactive,
* emotionally engaging.

---

## Analytics Cards

Cards display:

* assessment count,
* streaks,
* status,
* wellness trends.

Cards should use:

* icons,
* soft gradients,
* clean spacing.

---

# Assessment Design

## Assessment Experience

Assessments should feel:

* private,
* focused,
* calm,
* and non-judgmental.

---

## Question Layout

Use:

* one question at a time,
* large readable typography,
* large click targets,
* subtle transitions.

Avoid:

* long intimidating forms.

---

# Chat Companion Design

## Companion Name

Kalms AI Companion

---

## Personality

The assistant should feel:

* supportive,
* warm,
* patient,
* calm,
* non-robotic.

Avoid:

* sounding clinical,
* sounding overly human,
* pretending to be a therapist.

---

## Chat UI

Use:

* rounded bubbles,
* spacious layouts,
* subtle typing animations,
* calming backgrounds.

---

# Mood Tracking Design

## Mood Logging

Mood tracking should feel:

* effortless,
* visually engaging,
* emotionally expressive.

Use:

* emoji systems,
* sliders,
* mood heatmaps,
* trend charts.

---

# Animations

## Animation Philosophy

Animations should:

* reduce tension,
* feel smooth,
* feel natural,
* never feel distracting.

---

## Recommended Motion

### Transition Duration

```css
200ms – 350ms
```

### Easing

```css
ease-out
```

---

# Loading States

## Skeleton Screens

Use:

* grey logo variant,
* shimmer effects,
* soft placeholders.

Avoid:

* harsh spinners,
* flashing animations.

---

# Empty States

Every empty state should:

* reassure the user,
* explain the next step,
* include soft illustrations.

Example:

> “You haven’t completed an assessment yet.”

---

# Data Visualization

Charts should feel:

* elegant,
* smooth,
* readable,
* emotionally non-threatening.

Use:

* curved line charts,
* soft gradients,
* minimal gridlines.

Avoid:

* aggressive financial dashboard aesthetics.

---

# Dark Mode

Dark mode should use:

* deep purple backgrounds,
* soft contrast,
* muted surfaces,
* white/purple accents.

Avoid:

* pure black backgrounds.

---

# Mobile Responsiveness

Kalms is mobile-first.

Design should adapt smoothly to:

* phones,
* tablets,
* laptops,
* desktops.

---

# Responsive Breakpoints

## Mobile

```css
0px – 767px
```

## Tablet

```css
768px – 1023px
```

## Desktop

```css
1024px+
```

---

# Overall Product Feeling

Kalms should feel like:

* a modern emotional wellness companion,
* a premium startup product,
* a safe space for students,
* and a calm digital environment.

The user should feel:

* emotionally supported,
* visually relaxed,
* and encouraged to return daily.
