import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';
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
      status: '',
      errors: '',
    },
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const watchedState = onChange(state, (path, value) => {
        switch (value) {
          case 'valid':
            render(state, i18nInstance.t);
            break;
          case 'invalid':
            render(state, i18nInstance.t);
            break;
        }
      });

      const form = document.querySelector('.rss-form');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.querySelector('#url-input');
        state.form.value = input.value;
        validation(state, i18nInstance.t)
          .then(() => {
            watchedState.form.status = 'valid';
            state.form.links.push(state.form.value);
          })
          .catch((error) => {
            state.form.errors = error;
            watchedState.form.status = 'invalid';
          });
      });
    });
};

export default app;
