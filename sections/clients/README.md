# Klanten (Clients)

## Overview

Centraal beheer van alle klanten met hiërarchische weergave. Elke klant kan worden ge-expand om contactpersonen, locaties en projecten te zien.

## Components Provided

- `ClientTree.tsx` — Main tree container with search/filter
- `ClientTreeNode.tsx` — Individual client with expandable groups
- `ClientTreeEmpty.tsx` — Empty state component

## Callback Props

| Callback | Description |
|----------|-------------|
| `onClientSelect` | Called when client row clicked |
| `onProjectClick` | Navigate to project Gantt view |
| `onAddClient` | Open client creation form |
| `onEditClient` | Open client edit form |
| `onDeleteClient` | Delete client with confirmation |
| `onAddContact` | Add contact to client |
| `onAddLocation` | Add location to client |
| `onAddProject` | Create project for client |

## Visual Reference

See `screenshot.png` for the target UI design.
