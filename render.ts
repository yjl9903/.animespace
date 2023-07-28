#!/usr/bin/env optc

/// <reference types="optc/globals" />

import { fetch } from 'undici';
import { Anime } from '@animespace/core';
import { BgmClient } from 'bgmc';
import { makeSystem } from 'animespace';

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
  const client = new BgmClient(fetch as any, { maxRetry: 5 });
  const system = await makeSystem(path.resolve());
  const animes = await system.load({ filter: () => true });

  const render = async (anime: Anime, image = false) => {
    const season =
      anime.plan.season && anime.plan.season !== 1
        ? ` (第 ${anime.plan.season} 季)`
        : '';

    if ('bgm' in anime.plan) {
      if (image) {
        const bgmId = anime.plan.bgm as string;
        const link = `https://bangumi.tv/subject/${anime.plan.bgm}`;
        const subject = await client.subject(+bgmId).catch(() => undefined);
        const name = subject
          ? subject.name_cn || subject.name
          : anime.plan.title;
        const image = subject?.images.large
          ? `<a href="${link}"><img src="${subject.images.large}" alt="${name}" style="height:200px;" /></a>`
          : '';

        return (
          image +
          `<div style="display:flex;align-items:center;justify-content:center;height:2em;padding:4px;"><a href="${link}"">${name}</a></div>`
        );
      } else {
        return (
          `[${anime.plan.title}](https://bangumi.tv/subject/${anime.plan.bgm})` +
          season
        );
      }
    } else {
      return `[${anime.plan.title}](#Animes)` + season;
    }
  };

  const cells: string[] = [];
  for (const anime of animes.filter(a => a.plan.status === 'onair')) {
    cells.push(await render(anime, true));
  }

  if (cells.length > 0) {
    const COL = 4;
    text.push('### Onair', '');
    text.push(`<table><tbody>`);
    for (let i = 0; i < cells.length; i += COL) {
      const line: string[] = [];
      for (let j = i; j < i + COL; j++) {
        if (cells[j]) {
          line.push(`<td align="center">${cells[j]}</td>`);
        } else {
          line.push(`<td></td>`);
        }
      }
      text.push('<tr>' + line.join('') + '</tr>');
    }
    text.push(`</tbody></table>`);
  }

  text.push('', '### Finish', '');
  for (const anime of animes.filter(a => a.plan.status === 'finish')) {
    text.push('+ ' + (await render(anime)));
  }

  return text.join('\n');
}
