name: Add New Site/Model Data
description: Suggest a new AI model/environmental rating entry.
body:
  - type: input
    id: site
    attributes:
      label: Website Domain
      description: What’s the domain using the AI model? (e.g., chatgpt.com)
  - type: input
    id: model
    attributes:
      label: AI Model Name
      description: What model is being used? (e.g., GPT-4)
  - type: input
    id: energy
    attributes:
      label: Energy Usage
      description: Low / Medium / High
  - type: input
    id: water
    attributes:
      label: Water Usage
      description: Low / Medium / High / Unknown
  - type: dropdown
    id: rating
    attributes:
      label: GreenScore Rating (1–5)
      options:
        - 1
        - 2
        - 3
        - 4
        - 5
