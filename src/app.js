import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import * as Yup from 'yup';
import resources from './locales/index.js';
import parser from './parser.js';
import validate from './validate.js';
import { createContainerPosts, createContainerFeeds, renderLoading, renderFilling, renderError, renderClick } from './view.js';

const app = () => {
  const state = {
    form: {
      formState: '',
    },
    validLinks: [],
    feeds: [],
    posts: [],
    errorMessage: '',
    clickedLinks: [],
    activeItemId: '',
  };

  const allOriginsUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'form.formState': {
            if (value === 'loading') {
              renderLoading();
            } else if (value === 'filling') {
              renderFilling(i18nInstance.t);
            } else if (value === 'error') {
              renderError(state.errorMessage, i18nInstance.t);
            }
            break;
          }
          case 'posts':
            createContainerPosts(state, value, i18nInstance.t);
            break;
          case 'feeds':
            createContainerFeeds(value, i18nInstance.t);
            break;
          case 'clickedLinks':
            renderClick(state);
            break;
          default:
            break;
        }
      });

      const builtUpdate = (response, bigData) => {
        const data = response.posts;
        const diffData = data.filter((item) => !bigData.some((bigItem) => bigItem.title === item.title));
        return diffData;
      };

      const checkNewPost = (newState) => {
        const promises = newState.validLinks.map((link) =>
          axios
            .get(`${allOriginsUrl}${encodeURIComponent(link)}`)
            .then((response) => {
              const data = parser(response, i18nInstance.t);
              const difference = builtUpdate(data, newState.posts);
              if (difference.length !== 0) {
                watchedState.posts.unshift(...difference);
              }
            })
            .catch(() => {})
        );
        return Promise.all(promises).then(() => {
          setTimeout(() => checkNewPost(newState), 5000);
        });
      };

      Yup.setLocale({
        mixed: {
          notOneOf: i18nInstance.t('feedback.duplicate'),
          required: i18nInstance.t('feedback.empty'),
          default: i18nInstance.t('feedback.invalidUrl'),
        },
        string: {
          url: i18nInstance.t('feedback.invalidUrl'),
        },
      });

      const form = document.querySelector('.rss-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, state.validLinks, i18nInstance.t)
          .then(() => {
            watchedState.form.formState = 'loading';
          })
          .then(() => axios.get(`${allOriginsUrl}${encodeURIComponent(url)}`))
          .then((response) => {
            const data = parser(response, i18nInstance.t);
            const { mainDescription, mainTitle, posts } = data;
            const feeds = { mainTitle, mainDescription };
            watchedState.posts.push(...posts);
            watchedState.feeds.unshift(feeds);
            watchedState.form.formState = 'filling';
          })
          .then(() => {
            watchedState.validLinks.push(url);
            watchedState.form.formState = 'update';
          })
          .catch((err) => {
            if (err.message === 'Network Error') {
              watchedState.errorMessage = i18nInstance.t('feedback.axiosError');
            } else {
              watchedState.errorMessage = err.message;
            }
            watchedState.form.formState = 'error';
          });
      });
      checkNewPost(state);

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
          const targetID = e.target.getAttribute('data-id');
          watchedState.clickedLinks.push(targetID);
          watchedState.activeItemId = targetID;
          renderClick(watchedState);
        }
      });
    });
};

export default app;
