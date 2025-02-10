import { JSDOM } from 'jsdom';

export async function htmlReader(url: string) {
  const dom = await JSDOM.fromFile(url, {
    includeNodeLocations: true,
  });

  return new JSDOM(dom.serialize());
}
