import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validation = (data) => {
  const schema = yup.string().required().url('Ссылка должна быть валидным URL').validate(data);
  return schema;
};

const app = () => {
  const state = {
    form: {
      value: '',
      status: '',
      errors: '',
    },
  };

  const watchedState = onChange(state, (path, value) => {
    switch (value) {
      case 'valid':
        render(state);
        break;
      case 'invalid':
        render(state);
        break;
    }
  });

  const form = document.querySelector('.rss-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.querySelector('#url-input');
    state.form.value = input.value;
    validation(state.form.value)
      .then(() => {
        watchedState.form.status = 'valid';
      })
      .catch((error) => {
        state.form.errors = error;
        watchedState.form.status = 'invalid';
      });
  });
};

export default app;
