#!/usr/bin/env optc

/// <reference types="optc/globals" />

import { makeSystem } from 'animespace';
import { Anime, AnimePlan } from '@animespace/core';

const START = '<!-- __inject_start__ -->';
const END = '<!-- __inject_end__ -->';

export default async function () {
  const content = fs.readFileSync('README.md', 'utf-8');
  const start = content.indexOf(START);
  if (start === -1) return;
  const end = content.indexOf(END, start);
  const newContent =
    content.slice(0, start) +
    START +
    '\n' +
    (await render()) +
    '\n' +
    END +
    content.slice(end + END.length);
  console.log(newContent);
  fs.writeFileSync('README.md', newContent, 'utf-8');
}

async function render() {
  const text: string[] = [];
  const system = await makeSystem(path.resolve());
  const animes = await system.load({ filter: () => true });

  const render = (anime: Anime) => {
    const season =
      anime.plan.season && anime.plan.season !== 1
        ? ` (第 ${anime.plan.season} 季)`
        : '';
    if ('bgm' in anime.plan) {
      return (
        `+ [${anime.plan.title}](https://bangumi.tv/subject/${anime.plan.bgm})` +
        season
      );
    } else {
      return `+ [${anime.plan.title}](#Animes)` + season;
    }
  };

  text.push('### Onair', '');
  for (const anime of animes.filter(a => a.plan.status === 'onair')) {
    text.push(render(anime));
  }
  text.push('', '### Finish', '');
  for (const anime of animes.filter(a => a.plan.status === 'finish')) {
    text.push(render(anime));
  }

  return text.join('\n');
}
