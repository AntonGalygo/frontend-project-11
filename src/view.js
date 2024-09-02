const render = (state) => {
  switch (state.form.status) {
    case 'valid':
      alert('valid');
      break;

    case 'invalid':
      alert('invalid');
      break;
  }
};

export default render;
