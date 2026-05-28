# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/game-flow.spec.ts >> 3-User Game Flow >> should allow players to vote and host/co-hosts to reveal
- Location: tests/e2e/game-flow.spec.ts:4:9

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "Poker Planning Neo Poker Planning NEO" [ref=e5] [cursor=pointer]:
      - /url: /
      - img "Poker Planning Neo" [ref=e6]
      - generic [ref=e7]:
        - text: Poker Planning
        - img "NEO" [ref=e8]
    - generic [ref=e9]:
      - navigation [ref=e10]:
        - link "About" [ref=e11] [cursor=pointer]:
          - /url: /about
        - link "How it Works" [ref=e12] [cursor=pointer]:
          - /url: /how-it-works
      - button "v2026.05.28" [ref=e13] [cursor=pointer]
  - main [ref=e14]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Welcome to the Planning Lobby" [level=1] [ref=e18]:
          - text: Welcome to the Planning
          - text: Lobby
        - paragraph [ref=e19]:
          - text: Enter your name to get started, then create a new room or
          - text: join an existing one.
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Your Name
          - textbox "Enter Your Name" [ref=e23]: Host
        - button "Create New Room" [active] [ref=e24] [cursor=pointer]
        - generic [ref=e26]: OR
        - generic [ref=e27]:
          - generic [ref=e28]: Room Code
          - textbox "Enter Room Code" [ref=e29]
        - button "Join Room" [disabled] [ref=e30]
  - contentinfo [ref=e31]:
    - paragraph [ref=e32]: © 2025 Poker Planning Neo. All rights reserved.
```