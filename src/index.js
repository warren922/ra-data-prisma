import merge from "lodash/merge";
import buildDataProvider from "ra-data-graphql";
import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  DELETE,
  DELETE_MANY,
  UPDATE,
  UPDATE_MANY,
} from "ra-core";
import camelCase from "lodash/camelCase";
import pluralize from "pluralize";

import defaultBuildQuery from "./buildQuery";

const pluralizeText = (text) => {
  const pluralizeName = pluralize(text);
  if (text === pluralizeName) {
    return `${text}s`;
  }
  return pluralizeName;
};

const defaultOptions = {
  buildQuery: defaultBuildQuery,
  introspection: {
    operationNames: {
      [GET_LIST]: (resource) => {
        return pluralizeText(camelCase(resource.name));
      },
      [GET_ONE]: (resource) => `${camelCase(resource.name)}`,
      [GET_MANY]: (resource) => `${pluralizeText(camelCase(resource.name))}`,
      [GET_MANY_REFERENCE]: (resource) =>
        `${pluralizeText(camelCase(resource.name))}`,
      [CREATE]: (resource) => `create${resource.name}`,
      [UPDATE]: (resource) => `update${resource.name}`,
      [DELETE]: (resource) => `delete${resource.name}`,
    },
  },
};

export const buildQuery = defaultBuildQuery;

export default (options) => {
  return buildDataProvider(merge({}, defaultOptions, options)).then(
    (defaultDataProvider) => {
      return (fetchType, resource, params) => {
        // This provider does not support multiple deletions so instead we send multiple DELETE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === DELETE_MANY) {
          const { ids, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(DELETE, resource, {
                id,
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }
        // This provider does not support multiple deletions so instead we send multiple UPDATE requests
        // This can be optimized using the apollo-link-batch-http link
        if (fetchType === UPDATE_MANY) {
          const { ids, data, ...otherParams } = params;
          return Promise.all(
            ids.map((id) =>
              defaultDataProvider(UPDATE, resource, {
                data: {
                  id,
                  ...data,
                },
                ...otherParams,
              })
            )
          ).then((results) => {
            const data = results.reduce(
              (acc, { data }) => [...acc, data.id],
              []
            );

            return { data };
          });
        }

        return defaultDataProvider(fetchType, resource, params);
      };
    }
  );
};
