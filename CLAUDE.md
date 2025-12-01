# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickROT47 is a lightweight web-based ROT47 cipher tool that transforms ASCII visible characters (33-126) by shifting them 47 positions. This is a simple, static HTML/CSS/JavaScript application with no build process or dependencies.

## Development Commands

This is a static website project with no build system:
- **Run locally**: Open `index.html` directly in a browser or use a local web server
- **Deploy**: Push to GitHub and enable GitHub Pages (already configured at https://ipusiron.github.io/quick-rot47/)
- **No build/test/lint commands** - Pure HTML/CSS/JavaScript with no dependencies

## Architecture

### Core Implementation
The ROT47 algorithm is implemented in `script.js:2-11`:
- Takes ASCII characters in range 33-126
- Shifts each character by 47 positions within the 94-character range
- Non-printable ASCII characters are left unchanged

### File Structure
- `index.html` - Main UI with two textareas (input/output) and conversion buttons
- `script.js` - Contains ROT47 algorithm and UI interaction handlers
- `style.css` - Styling for the interface
- `assets/` - Contains screenshots and images

### Key Functions
- `rot47()` in `script.js:2` - Core ROT47 transformation logic
- `convertText()` in `script.js:15` - Handles button click to transform input text
- `copyResult()` in `script.js:22` - Copies output to clipboard (uses modern Clipboard API with `document.execCommand` fallback)
- `showToast()` in `script.js:45` - Displays temporary notification messages
- `setToInput()` in `script.js:62` - Copies output back to input for re-encoding
- `setSampleText()` in `script.js:72` - Populates input with sample text "Hello World! 123"

## Important Notes

- ROT47 is reversible - applying it twice returns the original text
- No external dependencies or frameworks are used
- Project is part of a "100 Security Tools with AI" initiative