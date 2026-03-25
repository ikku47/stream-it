#!/usr/bin/env node
/**
 * Helper: extract the Cookie header for youtube.com or music.youtube.com
 *
 * Usage:
 * 1) Open DevTools -> Network.
 * 2) Click a request to youtubei or videoplayback.
 * 3) Copy the "cookie:" header value and paste it when prompted.
 */

import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Paste Cookie header value: ", (answer) => {
  const value = answer.trim().replace(/^cookie:\s*/i, "");

  if (!value) {
    console.error("No cookie value provided.");
    process.exit(1);
  }

  console.log("\nAdd this to your .env:");
  console.log(`YOUTUBE_COOKIE="${value.replace(/"/g, '\\"')}"`);
  console.log("\nThen restart the dev server.");
  rl.close();
});
