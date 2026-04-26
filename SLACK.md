# Slack Integration

This document serves as a planning space for the Slack integration.

## Planning

### 1. Intentional "Shoutouts" (Channel Broadcasts)

**The Rule:** Never broadcast when a user passively collects a badge for themselves.
**The Feature:** Only broadcast when a user _assigns_ a badge to someone else, and make the broadcast optional.

- **How it works:** When assigning a badge in the OtterBadges Studio, add an optional text area: _"Add a message to share in Slack."_
- **The Result:** The Slackbot posts to a designated channel (like `#general` or `#shoutouts`): _"🌟 **Patrick** awarded the **Fire Extinguisher** badge to **Emily** for: 'Saving the production database last night!'"_
- **Why it works:** It turns the badge into a vehicle for peer-to-peer recognition, which is high-signal and culturally positive.

### 2. Private DMs for Notifications

**The Rule:** Keep administrative or personal updates out of public channels.
**The Feature:** The OtterBadges Slack App sends a direct message to a user when something relevant happens to _them_.

- **How it works:** We map OtterBadges accounts to Slack accounts (usually via matching email addresses).
- **The Result:** If I assign you a badge, the bot DMs you: _"You just earned a new badge from Patrick! [View Profile]"_.
- **Why it works:** Immediate dopamine hit for the user without spamming their coworkers.

### 3. The Friday Digest (Asynchronous Updates)

**The Rule:** Aggregate low-priority events into a single, predictable update.
**The Feature:** Instead of pinging Slack every time a new badge is created in the marketplace, we use a scheduled CRON job.

- **How it works:** Every Friday at 3:00 PM, the bot posts a "Weekly Wrap-up" to a social channel.
- **The Result:** _"🦦 **OtterBadges Weekly Wrap-up!** 3 new badges were added to the marketplace this week (including 'Bug Squasher'). Shoutout to **Sarah**, who collected the most badges this week!"_
- **Why it works:** It drives engagement back to the platform and celebrates the team, but only takes up one message a week.

### 4. Rich Link Unfurling (Quality of Life)

**The Rule:** Make sharing organic.
**The Feature:** Utilize Slack's Block Kit API to make URLs look great.

- **How it works:** When someone manually copy/pastes a link to a badge (e.g., `otterbadges.com/b/hero-award`) into any Slack conversation, the bot automatically "unfurls" it.
- **The Result:** It replaces the plain text link with a rich card showing the badge image, description, and maybe even an interactive "Collect" button right inside Slack.

### How we would build this (High Level)

When you're ready to implement, we would:

1. Create a **Slack App** in your workspace to get a Bot Token.
2. Add a `slackUserId` field to the Prisma `User` model.
3. Build a `/api/slack/events` webhook route in Next.js to handle Slack interactions.
4. Use Slack's **Block Kit Builder** to design beautiful, interactive messages.
