# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e7]:
          - button "previous" [disabled] [ref=e8]:
            - img "previous" [ref=e9]
          - button "next" [disabled] [ref=e11]:
            - img "next" [ref=e12]
          - generic [ref=e14]: 1 of 1 error
          - generic [ref=e15]:
            - text: Next.js (14.2.35) is outdated
            - link "(learn more)" [ref=e17] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
      - heading "Unhandled Runtime Error" [level=1] [ref=e23]
      - paragraph [ref=e24]: "TypeError: Cannot read properties of undefined (reading 'length')"
    - generic [ref=e25]:
      - heading "Source" [level=2] [ref=e26]
      - generic [ref=e27]:
        - link "src/app/transcripts/page.tsx (209:42) @ length" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: src/app/transcripts/page.tsx (209:42) @ length
          - img [ref=e31]
        - generic [ref=e35]: "207 | <div className=\"flex items-center gap-1\"> 208 | <MessageSquare className=\"h-4 w-4\" /> > 209 | {transcript.messages.length} messages | ^ 210 | </div> 211 | <div className=\"flex items-center gap-1\"> 212 | <Clock className=\"h-4 w-4\" />"
      - heading "Call Stack" [level=2] [ref=e36]
      - button "Show collapsed frames" [ref=e37] [cursor=pointer]
```