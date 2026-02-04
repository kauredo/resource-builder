# Q&A

## Target Users & Context

1. **Who are the therapists serving?** Children, adolescents, adults, or all? (This heavily influences visual style and resource types)
   Mostly children and adolescents.

2. **Solo practitioners or practices?** Will multiple therapists share resources/styles, or is this individual accounts?
   Solo practitioners.

3. **What therapeutic modalities?** Play therapy, CBT, art therapy, general talk therapy? This affects what resource types matter most.
   CBT and play therapy, integrated therapies and 3rd gen therapies.

---

## Resource Types & Output

4. **What specific resources do you envision?** You mentioned board games, emotion icons/characters. What else? Worksheets? Flashcards? Posters? Scenario cards?
   Yes, anything the therapist thinks the patient would benefit from.

5. **What's the output format?** Printable PDFs? Digital assets for tablets during sessions? Both?
   Both, but ideally printable PDFs to avoid screens during sessions.

6. **What sizes/dimensions?** Standard paper sizes? Card decks? Specific board game formats?
   Standard paper sizes, but also card decks and board game formats, should be able to be cut and glued together to make a board game for example.

---

## Style System

7. **One global style, or per-therapist styles?** Should each therapist build their own consistent visual identity, or is there one curated style everyone uses?
   Per therapist styles.
8. **What defines "style consistency"?** Same recurring characters across resources? Color palette? Illustration style? Typography?
   Yes.
9. **Should therapists be able to customize style, or pick from presets?**
   They should be able to customize style, but there should be presets to choose from.

---

## The Generation Engine

10. **What is "nano banana pro"?** I want to make sure I understand this correctly — is this an image generation API/service?
    Yes.

11. **What needs to be AI-generated vs designed?** Characters only? Full layouts? Icons? Everything?
    Everything. Ideally we would store images and detailed descriptions of the images in a database, and use the AI to generate the following images.

---

## Technical & Business

12. **User accounts and saving?** Do therapists log in, save their resources, build a library?
    Yes.
13. **Any payment model?** Free, subscription, one-time purchase?
    Subscription.
14. **Any compliance concerns?** HIPAA considerations if storing anything patient-related?
    Shouldn't need to store any patient related information. Its only to be used as a tool to help therapists create resources.

---

## Platform

15. **Web app, desktop app, or mobile?** Where do therapists primarily work?
    Web app.
16. **Offline capability needed?** For sessions without reliable internet?
    No.

---

## Follow-up questions:

1. **Nano Banana Pro** — I'm not finding documentation for this. Can you share a link or clarify what service this is? Is it possibly **Fal.ai**, **Replicate**, **Leonardo.ai**, or another image generation platform?
   Gemini 3 Pro Image (Nano Banana Pro), gemini-3-pro-image-preview

2. **Style onboarding flow** — When a therapist first signs up, do they:
   - Pick a preset style and optionally customize?
   - Build a style from scratch by defining characters, colors, etc.?
   - Generate a "style" by describing what they want in natural language?
     They should be able to do all of the above, review, make changes and perfect it.

3. **Resource creation flow** — Walk me through an ideal user journey. Does the therapist:
   - Describe what they want in plain text ("I need a board game about managing anger")?
   - Pick a template type first, then customize?
   - Something else?
     They should be able to do all of the above, review, make changes and perfect it.

4. **Character persistence** — If a therapist creates "Benny the Bear" as their mascot, should Benny appear consistently across all their resources? How important is visual consistency of specific characters?
   Yes, as long as the therapist wants him to. If there is no mention of Benny, then he should not appear.

5. **Tech preferences** — Any preference on framework (Next.js, Remix, etc.) or database? Or should I recommend based on the requirements?
   Recommend based on the requirements. I think using convex would be a good choice for the database.

---

Got it — Gemini 3 Pro Image ("Nano Banana Pro"). Now I have a complete picture.

---

### Final Questions Before Building

1. **Auth provider** — Convex Auth (simpler) or Clerk (more features like social login, MFA)?
   Lets keep it simple with Convex Auth for now.

2. **Style presets** — Should I design 3-5 starter presets (e.g., "Warm & Playful", "Calm & Minimal", "Bold & Colorful")?
   Yes, please.

3. **MVP scope** — For v1, should we start with:
   - One resource type (e.g., emotion cards) to nail the flow?
   - Or build the flexible "describe anything" system from day one?
     Lets start with one resource type to nail the flow. Document the flow and then expand to other resource types.

4. **Do you have a Google AI API key** for Gemini, or should I set up the project to use environment variables you'll fill in?
   I'll fill in the environment variables later.
