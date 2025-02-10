import { htmlReader } from './html-reader';
import { getConfig } from './utils/config';

export async function render() {
  try {
    const config = await getConfig();

    const browser = await htmlReader(config.url);

    const document = browser.window.document;
    if (!document) {
      const message = ' JSDOM...browser.window.document.defaultView not found';
      console.error(message);
      throw message;
    }

    const scripts: { src: string; code: string }[] = [];
    // console.log(import.meta.dirname);

    for (const script of document.scripts) {
      console.log("FIX THE PATH")

      const src = '../' + config.root + script['src'].substring(2)

      // TODO  use Promise.all all at once
      scripts.push({ src, code: await import(src) });
    }

    console.log(scripts)
    // return {
    //   document,
    //   html: browser.serialize(),
    //   scripts,
    // };
  } catch (error) {
    console.log(JSON.stringify(error))
    if (error === '{"code":"ERR_UNKNOWN_FILE_EXTENSION"}') {
      console.log('JSX')
      return
    }
    // throw error;
  }
}
