import uniqueId from 'lodash';

const parser = (response, i18n) => {
  const pars = new DOMParser();
  const doc = pars.parseFromString(response.data.contents, 'text/xml');
  if (!doc.querySelector('rss')) {
    throw new Error(i18n('feedback.invalidUrl'));
  }
  const items = doc.querySelectorAll('item');
  const mainTitle = doc.querySelector('channel > title').textContent;
  const mainDescription = doc.querySelector('channel > description').textContent;
  const data = { mainTitle, mainDescription, posts: [] };
  items.forEach((item) => {
    const id = uniqueId();
    const title = item.querySelector('title').textContent;
    const href = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    data.posts.push({
      title,
      description,
      href,
      id,
    });
  });
  return data;
};
export default parser;
