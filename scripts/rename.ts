import { makeSystem } from 'animespace';

const system = await makeSystem();

const pathname = '动物狂想曲 最终季 第二部分';
const name = '动物狂想曲';
const season = 3;
const offset = 12;

const directory = system.space.storage.default.join(pathname);
const files = await directory.list();

for (const file of files) {
  const match = /\[(\d+)\]/.exec(file.basename);
  if (!match) continue;

  const ep = +match[1] + offset;
  const epText = ep < 10 ? '0' + ep : '' + ep;

  const target = directory.join(`${name} S0${season}E${epText}.mp4`);
  console.log(file.path, '->', target.path);
  await file.moveTo(target as any);
}
