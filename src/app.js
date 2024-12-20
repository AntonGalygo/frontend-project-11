import { string } from 'yup';
import axios from 'axios';
import i18n from 'i18next';
import parseRss from './parser.js';
import resources from './locales/index.js';
import { elements, startStateWatching } from './view.js';

const state = {
  app: {
    state: '',
    nextId: 0,
    feeds: [],
    posts: [],
  },
  ui: {
    modalId: null,
    posts: [],
  },
};

export default () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const watchedState = startStateWatching(state, i18nInstance);
      const alloriginsUrl = 'https://allorigins.hexlet.app/get?disableCache=true';

      const createSchema = () => {
        const existedUrls = state.app.feeds.map(({ feedUrl }) => feedUrl);
        return string().url().notOneOf(existedUrls);
      };

      const addPostInPosts = (post, feedId) => {
        const postId = watchedState.app.nextId;
        watchedState.app.nextId += 1;
        const { postUrl, postTitle, postDescription } = post;

        watchedState.app.posts.push({
          feedId,
          postId,
          postUrl,
          postTitle,
          postDescription,
        });

        watchedState.ui.posts.push({
          postId,
          state: 'notViewed',
        });
      };

      const getUrlFromResponse = (response) => {
        const { url } = response.config;
        const splittedUrl = url.split('url=');
        const encodedUrl = splittedUrl[1];
        return decodeURIComponent(encodedUrl);
      };

      const startUpdatingPosts = () => {
        const promises = watchedState.app.feeds.map(({ feedUrl }) => axios.get(`${alloriginsUrl}&url=${encodeURIComponent(feedUrl)}`));

        Promise.all(promises)
          .then((responses) => {
            responses.forEach((response) => {
              const currentUrl = getUrlFromResponse(response);
              const feed = watchedState.app.feeds.find(({ feedUrl }) => feedUrl === currentUrl);
              const { feedId } = feed;

              const parsed = parseRss(response.data.contents, 'text/xml');
              const { posts } = parsed;
              /* eslint-disable max-len */
              const filteredPostsUrls = watchedState.app.posts.filter((post) => post.feedId === feedId).map((post) => post.postUrl);

              posts.forEach((post) => {
                const { postUrl } = post;
                if (!filteredPostsUrls.includes(postUrl)) {
                  addPostInPosts(post, feedId);
                }
              });
              watchedState.app.state = 'uploading';
              watchedState.app.state = 'updated';
            });
          })
          .catch((error) => {
            console.log(`Updating error: ${error}`);
          })
          .finally(() => {
            setTimeout(startUpdatingPosts, 5000);
          });
      };

      startUpdatingPosts();

      const getTypeError = (error) => {
        if (axios.isAxiosError(error)) {
          return 'networkError';
        }

        if (error.name === 'ValidationError') {
          switch (error.type) {
            case 'url':
              return 'invalidUrl';
            case 'notOneOf':
              return 'exists';
            default:
              throw new Error(`Unknown error.type: ${error.type}`);
          }
        }
        return new Error(`Unknown error.type: ${error.type}`);
      };

      elements.postsContainer.addEventListener('click', (e) => {
        const getViewedPost = (button) => {
          const id = Number(button.id);
          return watchedState.ui.posts.find((post) => post.postId === id);
        };

        switch (e.target.tagName) {
          case 'A': {
            const button = e.target.nextSibling;
            const viewedPost = getViewedPost(button);
            viewedPost.state = 'viewed';
            break;
          }
          case 'BUTTON': {
            const viewedPost = getViewedPost(e.target);
            viewedPost.state = 'viewed';
            watchedState.ui.modalId = Number(e.target.id);
            break;
          }
          default:
            break;
        }
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredUrl = elements.input.value;

        createSchema()
          .validate(enteredUrl)
          .then((url) => {
            watchedState.app.state = 'uploading';
            return axios.get(`${alloriginsUrl}&url=${encodeURIComponent(url)}`);
          })
          .then((response) => {
            const parsed = parseRss(response.data.contents, 'text/xml');
            if (parsed === 'parsererror') {
              watchedState.app.state = 'invalidRss';
              return;
            }

            const feedId = watchedState.app.nextId;
            watchedState.app.nextId += 1;
            const feedUrl = getUrlFromResponse(response);
            const { feedTitle, feedDescription } = parsed.feed;

            watchedState.app.feeds.push({
              feedId,
              feedUrl,
              feedTitle,
              feedDescription,
            });

            parsed.posts.forEach((post) => {
              addPostInPosts(post, feedId);
            });

            watchedState.app.state = 'uploaded';
          })
          .catch((error) => {
            watchedState.app.state = getTypeError(error);
          });
      });
    });
};
