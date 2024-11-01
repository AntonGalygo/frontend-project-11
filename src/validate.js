import * as Yup from 'yup';

const validateUrl = (url, validLinks, i18n) => {
  const schema = Yup.string().trim().required().url(i18n('feedback.invalidUrl')).notOneOf(validLinks, i18n('feedback.duplicate')).validate(url);
  return schema;
};
export default validateUrl;
