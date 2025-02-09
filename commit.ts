#!/usr/bin/env optc

/// <reference types="optc/globals" />

export default async function () {
  const date = new Date();
  const commit = `refresh: ${date.toLocaleString()}`;

  await $`git add plans library`;
  await $`git commit -m ${commit}`;
  await $`git pull --rebase`;
  await $`git push origin main`;
}
