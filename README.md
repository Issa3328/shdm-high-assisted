# shdm-low-flow
Interactive React prototype for the SHDM (Smart Home Data Management) usability study — Low Visibility Flow. Includes full interaction logging (clicks, timing, task completion) with CSV/JSON export.

# SHDM – Low Visibility Flow

An interactive React prototype simulating a smart home interface with **low information visibility**, built for a usability study investigating trust and perceived privacy in smart home systems.

## Overview

This prototype walks participants through a realistic smart home flow:

1. **Home** – Smart home dashboard with quick access to privacy settings
2. **Privacy Settings** – Minimal Deny/Allow controls for Data Collection and Data Usage
3. **Offers** – Browse available offers across categories
4. **Order Summary** – Review and confirm an order
5. **Confirmation** – Order placed confirmation screen

The prototype does not connect to any real smart home devices — the focus is on simulating realistic interactions for research purposes.

## Features

- Faithful 1:1 implementation of the original Figma design
- Persistent privacy settings (saved across reloads via localStorage)
- Built-in interaction logger tracking:
  - Time spent per page/screen
  - Button and toggle clicks
  - Tab switches
  - Task completion events
  - Order placement
- One-click **CSV** and **JSON** export of all logged interaction data

## Tech Stack

- React (Create React App)
- Plain CSS (no external UI libraries)
- Browser localStorage for persistence

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

The app runs locally at `http://localhost:3000`.

## Research Context

Part of a larger SHDM usability study comparing three levels of information visibility (Low / Medium / High) in smart home privacy interfaces.
