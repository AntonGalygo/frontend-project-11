const render = (state, i18n) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  switch (state.form.status) {
    case 'valid':
      feedback.textContent = i18n('feedback.success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      input.classList.remove('is-invalid');
      break;

    case 'invalid':
      feedback.textContent = i18n('feedback.invalidUrl');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
  }
};

export default render;
