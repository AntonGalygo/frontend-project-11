import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import parser from './parser.js';
import { render } from './view.js';
import i18next from 'i18next';
import resources from './locales/index.js';

const validation = (state) => {
  const schema = yup.string().trim().required().url().notOneOf(state.form.links, 'dupl').validate(state.form.value);
  return schema;
};

const app = () => {
  const state = {
    form: {
      value: '',
      links: [],
      posts: [],
      feeds: [],
      formState: '',
      errors: '',
    },
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
          case 'form.formState':
            if (value === 'load') {
              render(state, i18nInstance.t);
            } else if (value === 'invalid') {
              render(state, i18nInstance.t);
            }

            break;
          case 'invalid':
            render(state, i18nInstance.t);
            break;
        }
      });

      yup.setLocale({
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
        const input = document.querySelector('#url-input');
        state.form.value = input.value;
        validation(state, i18nInstance.t)
          .then(() => {
            watchedState.form.formState = 'load';
            state.form.links.push(state.form.value);
          })
          .then(() => axios.get(`${allOriginsUrl}${encodeURIComponent(state.form.value)}`))
          .then((response) => {
            const data = parser(response, i18nInstance.t);
            console.log(data);
            const { mainDescription, mainTitle, posts } = data;
            const feeds = { mainTitle, mainDescription };
            watchedState.posts.push(...posts);
            watchedState.feeds.unshift(feeds);
            watchedState.form.formState = 'filling';
            console.log(state.form.posts);
            console.log(state.form.feeds);
          })
          .catch((error) => {
            state.form.errors = error;
            watchedState.form.formState = 'invalid';
          });
      });
    });
};

export default app;
