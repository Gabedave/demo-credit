const validateRequiredFieldsNotUndefined = (fields: Array<any>) => {
  return !fields.some((field) => {
    return field === undefined;
  });
};

const ValidateNamespace = { validateRequiredFieldsNotUndefined };

export default ValidateNamespace;
