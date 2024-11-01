const createAndAppendElement = (parent, elementType, classes, content, attributes) => {
  const element = document.createElement(elementType);
  classes.forEach((className) => {
    element.classList.add(className);
  });
  if (content) {
    element.textContent = content;
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }
  parent.append(element);
  return element;
};

export const renderLoading = () => {
  const feedback = document.querySelector('.feedback');
  const sendButton = document.querySelector('[type="submit"]');
  sendButton.disabled = true;
  feedback.classList.remove('text-danger', 'text-success', 'is-invalid');
  feedback.textContent = '';
};

export const createContainerPosts = (state, posts, i18n) => {
  const items = [...posts].reverse();
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = '';

  const divCardBorder = createAndAppendElement(postsContainer, 'div', ['card', 'border-0']);
  const divCardBody = createAndAppendElement(divCardBorder, 'div', ['card-body']);
  createAndAppendElement(divCardBody, 'h2', ['card-title', 'h4'], i18n('items.posts'));
  createAndAppendElement(divCardBorder, 'ul', ['list-group', 'border-0', 'rounded-0']);

  const ulPost = document.querySelector('.posts > .card > .list-group');
  items.forEach((item) => {
    const { title, href, id } = item;
    const li = createAndAppendElement(ulPost, 'li', ['list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0']);
    const linkClasses = state.clickedLinks.includes(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
    createAndAppendElement(li, 'a', linkClasses, title, {
      href,
      'data-id': id,
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    createAndAppendElement(li, 'button', ['btn', 'btn-outline-primary', 'btn-sm'], i18n('buttons.view'), {
      type: 'button',
      'data-id': id,
      'data-bs-toggle': 'modal',
      'data-bs-target': '#modal',
    });
    ulPost.prepend(li);
  });
  return null;
};

export const createContainerFeeds = (feeds, i18n) => {
  const feed = feeds[0];
  const { mainTitle, mainDescription } = feed;
  const feedsContainer = document.querySelector('.feeds');
  let ulFeeds;

  if (!feedsContainer.hasChildNodes()) {
    const divFeeds = createAndAppendElement(feedsContainer, 'div', ['card', 'border-0']);
    const divCard = createAndAppendElement(divFeeds, 'div', ['card-body']);
    ulFeeds = createAndAppendElement(divFeeds, 'ul', ['list-group', 'border-0', 'rounded-0']);
    createAndAppendElement(divCard, 'h2', ['card-title', 'h4'], i18n('items.feeds'));
  } else {
    ulFeeds = document.querySelector('.feeds > .card > .list-group');
  }
  const li = createAndAppendElement(ulFeeds, 'li', ['list-group-item', 'border-0', 'border-end-0']);
  createAndAppendElement(li, 'h3', ['h6', 'm-0'], mainTitle);
  createAndAppendElement(li, 'p', ['m-0', 'small', 'text-black-50'], mainDescription);
  ulFeeds.insertBefore(li, ulFeeds.firstChild);
};

export const renderFilling = (i18n) => {
  const feedback = document.querySelector('.feedback');
  const inputText = document.querySelector('#url-input');
  const sendButton = document.querySelector('[type="submit"]');
  sendButton.disabled = true;
  feedback.classList.remove('text-danger', 'text-success', 'is-invalid');
  feedback.textContent = '';

  if (inputText.classList.contains('is-invalid')) {
    inputText.classList.remove('is-invalid');
  }
  feedback.classList.add('text-success');
  feedback.textContent = i18n('feedback.success');
  inputText.value = '';
  inputText.focus();
  sendButton.removeAttribute('disabled');
};

export const renderError = (errorText) => {
  const feedback = document.querySelector('.feedback');
  const inputText = document.querySelector('#url-input');
  const sendButton = document.querySelector('[type="submit"]');
  sendButton.removeAttribute('disabled');
  if (!inputText.classList.contains('is-invalid')) {
    inputText.classList.add('is-invalid');
  }
  feedback.classList.add('text-danger');
  const errorKey = `${errorText}`;
  if (errorKey) {
    feedback.textContent = errorText;
  }
};

export const renderClick = (state) => {
  const idClickLink = state.clickedLinks;
  idClickLink.forEach((id) => {
    const postElement = document.querySelector(`a[data-id="${id}"]`);
    postElement.classList.add('fw-normal', 'link-secondary');
    postElement.classList.remove('fw-bold');
  });
  const { activeItemId } = state;
  const activeItem = state.posts.find((item) => item.id === activeItemId);

  if (activeItem) {
    const { title, href, description } = activeItem;
    document.querySelector('.modal-header > h5').textContent = title;
    document.querySelector('.modal-content > .modal-body').textContent = description;
    document.querySelector('.modal-footer > a').setAttribute('href', href);
  }
};
