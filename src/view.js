const input = document.querySelector('#url-input');
const feedback = document.querySelector('.feedback');
const cont = document.querySelector('.container-xxl');
const posts = document.querySelector('.posts');
const feeds = document.querySelector('.feeds');

const createPostsList = (container, containerHeader) => {
  container.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  container.append(card);

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  card.append(cardBody);

  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = containerHeader;
  cardBody.append(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  card.append(ul);

  return ul;
};

export const render = (state, i18n) => {
  switch (state.form.formState) {
    case 'load':
      feedback.textContent = i18n('feedback.success');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      input.classList.remove('is-invalid');
      createPostsList(posts, 'Посты');
      break;

    case 'invalid':
      feedback.textContent = i18n('feedback.invalidUrl');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
  }
};
